import { prisma } from '../connection/prisma.js'
import { bot } from '../connection/token.js'
import { logger } from '../utils/logger.js'
import { monitoring } from '../utils/monitoring.js'
import { config } from '../config.js'
import cron from 'node-cron'

const DELAY_MS = 100 // Задержка 100 мс

export class DailyMessage {
	constructor() {
		this.url_taskMap = {}
		this.num = 0
	}

	async delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	async start(test = false) {
		if (this.url_taskMap['job']) {
			logger.info('Daily message task already running.')
			return
		}
		const cronTask = cron.schedule(config.CRON_SCHEDULE, async () => {
			try {
				const users = await prisma.user.findMany({
					select: { userId: true },
				})

				if (!users.length) {
					logger.info('No users found for daily message.')
					return
				}

				logger.info(`Starting daily message for ${users.length} users.`)

				if (test) {
					try {
						const randomId = Math.floor(Math.random() * 365) + 1
						const image = !(this.num % 2)
							? await prisma.oldImage.findUnique({
									where: { id: randomId },
									select: { url: true },
							  })
							: await prisma.newImage.findUnique({
									where: { id: randomId },
									select: { url: true },
							  })
						await bot.telegram.sendPhoto(config.testID, {
							source: image.url,
						})
						monitoring.updateMessageStats(true)
						logger.info(`Sent daily message to user ${config.testID}`)
					} catch (error) {
						monitoring.updateMessageStats(false, error)
						logger.error(`Error sending message to ${config.testID}:`, {
							message: error.message,
							code: error.code,
							stack: error.stack,
						})
					}
				} else {
					for (const { userId } of users) {
						try {
							const randomId = Math.floor(Math.random() * 365) + 1
							const image = !(this.num % 2)
								? await prisma.oldImage.findUnique({
										where: { id: randomId },
										select: { url: true },
								  })
								: await prisma.newImage.findUnique({
										where: { id: randomId },
										select: { url: true },
								  })
							await bot.telegram.sendPhoto(userId.toString(), {
								source: image.url,
							})
							monitoring.updateMessageStats(true)
						} catch (error) {
							monitoring.updateMessageStats(false, error)
							logger.error(`Error sending message to ${userId}:`, {
								message: error.message,
								code: error.code,
								stack: error.stack,
							})
							if (error.code === 403) {
								await prisma.user.delete({ where: { userId } })
								logger.info(`Removed blocked user ${userId}`)
							} else if (error.code === 429) {
								logger.warn(
									`Rate limit exceeded for ${userId}, retrying after delay.`
								)
								await this.delay(1000)
								try {
									await bot.telegram.sendPhoto(userId.toString(), {
										source: image.url,
									})
									monitoring.updateMessageStats(true)
									logger.info(`Retry successful for user ${userId}`)
								} catch (retryError) {
									monitoring.updateMessageStats(false, retryError)
									logger.error(`Retry failed for ${userId}:`, {
										message: retryError.message,
										stack: retryError.stack,
									})
								}
							}
						}
						await this.delay(DELAY_MS)
					}
				}
				await monitoring.logStats()

				logger.info('Daily message task completed.', {
					userCount: users.length,
				})
			} catch (error) {
				logger.error('Error in daily message task:', {
					message: error.message,
					stack: error.stack,
				})
			}
			this.num++
		})
		this.url_taskMap['job'] = cronTask
		logger.info('Daily message task created.')
	}

	stop() {
		if (this.url_taskMap['job']) {
			this.url_taskMap['job'].stop()
			delete this.url_taskMap['job']
			logger.info('Daily message task stopped.')
		}
	}
}

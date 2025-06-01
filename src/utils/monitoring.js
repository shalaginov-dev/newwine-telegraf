import { logger } from './logger.js'
import { prisma } from '../connection/prisma.js'
import { bot } from '../connection/token.js'

class BotMonitoring {
	constructor() {
		this.stats = {
			startTime: new Date(),
			totalMessages: 0,
			successfulMessages: 0,
			failedMessages: 0,
			errors: {
				403: 0, // blocked users
				429: 0, // rate limit
				other: 0,
			},
			lastSuccessfulMessage: null,
		}
	}

	// Обновление статистики после отправки сообщения
	updateMessageStats(success, error = null) {
		this.stats.totalMessages++

		if (success) {
			this.stats.successfulMessages++
			this.stats.lastSuccessfulMessage = new Date()
		} else {
			this.stats.failedMessages++
			if (error) {
				if (error.code === 403) {
					this.stats.errors[403]++
				} else if (error.code === 429) {
					this.stats.errors[429]++
				} else {
					this.stats.errors.other++
				}
			}
		}
	}

	// Получение статистики
	async getStats() {
		const users = await prisma.user.count()
		const uptime = Math.floor((new Date() - this.stats.startTime) / 1000) // в секундах

		return {
			uptime: this.formatUptime(uptime),
			users: {
				total: users,
			},
			messages: {
				total: this.stats.totalMessages,
				successful: this.stats.successfulMessages,
				failed: this.stats.failedMessages,
				successRate: this.calculateSuccessRate(),
			},
			errors: this.stats.errors,
			lastSuccessfulMessage: this.stats.lastSuccessfulMessage,
		}
	}

	// Проверка состояния бота
	async checkBotHealth() {
		try {
			// Проверка подключения к Telegram API
			const botInfo = await bot.telegram.getMe()

			// Проверка подключения к базе данных
			await prisma.$queryRaw`SELECT 1`

			return {
				status: 'healthy',
				botInfo: {
					username: botInfo.username,
					id: botInfo.id,
				},
				database: 'connected',
			}
		} catch (error) {
			logger.error('Health check failed:', error)
			return {
				status: 'unhealthy',
				error: error.message,
			}
		}
	}

	// Форматирование времени работы
	formatUptime(seconds) {
		const days = Math.floor(seconds / 86400)
		const hours = Math.floor((seconds % 86400) / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const remainingSeconds = seconds % 60

		return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`
	}

	// Расчет процента успешных отправок
	calculateSuccessRate() {
		if (this.stats.totalMessages === 0) return 0
		return (
			(this.stats.successfulMessages / this.stats.totalMessages) *
			100
		).toFixed(2)
	}

	// Логирование статистики
	async logStats() {
		const stats = await this.getStats()
		const health = await this.checkBotHealth()

		logger.info('Bot Statistics:', {
			...stats,
			health,
		})
	}
}

export const monitoring = new BotMonitoring()

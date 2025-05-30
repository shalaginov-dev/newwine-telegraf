import { logger } from '../utils/logger.js'

export function errorHandler(bot) {
	bot.catch((err, ctx) => {
		logger.error(`Error while handling update ${ctx.update.update_id}:`, {
			update: ctx.update,
		})

		// Проверяем тип ошибки
		if (err.code && err.description) {
			// Ошибка Telegram API
			if (err.code === 403) {
				logger.error('Bot was blocked by user:', {
					code: err.code,
					description: err.description,
				})
			} else if (err.code === 429) {
				logger.error('Rate limit exceeded:', {
					code: err.code,
					description: err.description,
				})
			} else {
				logger.error('Telegram API error:', {
					code: err.code,
					description: err.description,
				})
			}
		} else if (err.name === 'FetchError' || err.message.includes('network')) {
			// Сетевая ошибка
			logger.error('Could not contact Telegram:', {
				message: err.message,
				stack: err.stack,
			})
		} else {
			// Неизвестная ошибка
			logger.error('Unknown error:', {
				message: err.message,
				stack: err.stack,
			})
		}
	})
}

import { DailyMessage } from '../service/dailyMessage.js'
import { logger } from '../utils/logger.js'
import { config } from '../config.js'

async function testProduction() {
	config.CRON_SCHEDULE = '*/2 * * * * *'
	try {
		// Запускаем сервис отправки сообщений
		logger.info('Запускаем сервис отправки сообщений с тестовым cron...')
		const dailyMessage = new DailyMessage()
		await dailyMessage.start(true)

		// Даем сервису поработать 1 минуту
		logger.info('Сервис запущен. Тестируем в течение 1 минуты...')
		await new Promise(resolve => setTimeout(resolve, 60000))

		// Останавливаем сервис
		logger.info('Останавливаем сервис...')
		dailyMessage.stop()
		logger.info('Тестирование завершено')
	} catch (error) {
		logger.error('Ошибка при тестировании:', error)
	} finally {
		// Возвращаем старое значение
		config.CRON_SCHEDULE = '0 10 * * *'
	}
}

testProduction()

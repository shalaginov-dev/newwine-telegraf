import { startComposer } from './middleware/command/start.js'
import { stopComposer } from './middleware/command/stop.js'
import { errorHandler } from './middleware/errorHandler.js'
import { DailyMessage } from './service/dailyMessage.js'
import { linksComposer } from './middleware/command/links.js'
import { statsComposer } from './middleware/hears/stats.js'
import { detoxComposer } from './middleware/command/detox.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { prisma } from './connection/prisma.js'
import { bot } from './connection/token.js'
import { logger } from './utils/logger.js'

const dailyMessage = new DailyMessage()

// Подключение обработчика ошибок
errorHandler(bot)

// Подключение всех middleware
bot.use(
	rateLimiter(),
	startComposer(),
	stopComposer(),
	linksComposer(),
	statsComposer(),
	detoxComposer()
)

// Запуск бота
async function main() {
	try {
		await dailyMessage.start()
		await bot.launch()
	} catch (error) {
		logger.error('Ошибка запуска:', error)
		await prisma.$disconnect()
		process.exit(1)
	}
}

// Graceful shutdown для SIGINT и SIGTERM
const gracefulShutdown = async signal => {
	logger.info(`Получен сигнал ${signal}. Остановка бота...`)
	try {
		dailyMessage.stop()
		await bot.stop(signal) // Останавливаем Telegraf
		logger.info('Telegraf остановлен.')
		await prisma.$disconnect() // Закрываем соединение с Prisma
		logger.info('Prisma отключён.')
		process.exit(0)
	} catch (error) {
		logger.error('Ошибка при завершении:', error)
		process.exit(1)
	}
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

main()

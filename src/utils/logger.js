import { createLogger, format, transports } from 'winston'
import 'winston-daily-rotate-file'

export const logger = createLogger({
	level: 'info',
	format: format.combine(format.timestamp(), format.json()),
	transports: [
		new transports.Console(),
		// Ротация файлов с ошибками
		new transports.DailyRotateFile({
			filename: 'logs/error-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			level: 'error',
			maxFiles: '14d', // Хранить логи 14 дней
			maxSize: '20m',  // Максимальный размер файла 20MB
			zippedArchive: true // Архивировать старые логи
		}),
		// Ротация всех логов
		new transports.DailyRotateFile({
			filename: 'logs/combined-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			maxFiles: '14d',
			maxSize: '20m',
			zippedArchive: true
		})
	],
})

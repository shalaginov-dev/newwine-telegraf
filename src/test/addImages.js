import { addImgLinkToDB } from '../utils/addImgLinkToDB.js'
import { prisma } from '../connection/prisma.js'
import { logger } from '../utils/logger.js'

async function testAddImages() {
	try {
		// Очищаем таблицы перед тестом
		await prisma.oldImage.deleteMany()
		await prisma.newImage.deleteMany()
		logger.info('Таблицы очищены')

		// Добавляем изображения
		await addImgLinkToDB()

		// Проверяем результаты
		const oldImages = await prisma.oldImage.findMany({
			orderBy: { id: 'asc' },
		})
		const newImages = await prisma.newImage.findMany({
			orderBy: { id: 'asc' },
		})

		logger.info('Старые изображения:')
		oldImages.forEach(img => {
			logger.info(`ID: ${img.id}, URL: ${img.url}`)
		})

		logger.info('\nНовые изображения:')
		newImages.forEach(img => {
			logger.info(`ID: ${img.id}, URL: ${img.url}`)
		})

		logger.info(`\nВсего добавлено:`)
		logger.info(`Старых изображений: ${oldImages.length}`)
		logger.info(`Новых изображений: ${newImages.length}`)
	} catch (error) {
		logger.error('Ошибка при тестировании:', error)
	} finally {
		await prisma.$disconnect()
	}
}

// Запускаем тест
testAddImages()
 
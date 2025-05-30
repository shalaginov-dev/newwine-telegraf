import { prisma } from '../connection/prisma.js'
import { logger } from '../utils/logger.js'

async function clearImages() {
    try {
        // Удаляем все записи из обеих таблиц
        const oldImages = await prisma.oldImage.deleteMany()
        const newImages = await prisma.newImage.deleteMany()

        logger.info('База данных очищена:', {
            deletedOldImages: oldImages.count,
            deletedNewImages: newImages.count
        })
    } catch (error) {
        logger.error('Ошибка при очистке базы данных:', error)
    } finally {
        await prisma.$disconnect()
    }
}

clearImages() 
import { addImgLinkToDB } from '../utils/addImgLinkToDB.js'
import { DailyMessage } from '../service/dailyMessage.js'
import { logger } from '../utils/logger.js'

async function testProduction() {
    try {
        // 1. Добавляем изображения в базу
        logger.info('Начинаем добавление изображений в базу...')
        await addImgLinkToDB()
        logger.info('Изображения успешно добавлены в базу')

        // 2. Запускаем сервис отправки сообщений
        logger.info('Запускаем сервис отправки сообщений...')
        const dailyMessage = new DailyMessage()
        await dailyMessage.start()

        // 3. Даем сервису поработать 1 минуту
        logger.info('Сервис запущен. Тестируем в течение 1 минуты...')
        await new Promise(resolve => setTimeout(resolve, 60000))

        // 4. Останавливаем сервис
        logger.info('Останавливаем сервис...')
        dailyMessage.stop()
        logger.info('Тестирование завершено')

    } catch (error) {
        logger.error('Ошибка при тестировании:', error)
    }
}

testProduction() 
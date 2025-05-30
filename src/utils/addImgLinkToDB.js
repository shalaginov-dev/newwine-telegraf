import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { prisma } from '../connection/prisma.js'
import { logger } from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const baseDir = path.join(__dirname, '../../public') // Путь к папке public
const subDirs = ['old_img', 'new_img']

/**
 * Добавляет пути к изображениям в базу данных
 * @returns {Promise<void>}
 */
export async function addImgLinkToDB() {
	try {
		for (const subDir of subDirs) {
			const uploadDir = path.join(baseDir, subDir)
			
			// Проверяем существование директории
			try {
				await fs.access(uploadDir)
			} catch {
				logger.warn(`Папка ${uploadDir} не существует`)
				continue
			}

			// Получаем список файлов
			const files = await fs.readdir(uploadDir)
			
			// Фильтруем только изображения
			const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i))
			
			// Добавляем каждый файл в соответствующую таблицу
			for (const file of imageFiles) {
				const filePath = `public/${subDir}/${file}`
				const imageNumber = parseInt(file.match(/\d+/)[0])
				
				try {
					if (subDir === 'old_img') {
						await prisma.oldImage.upsert({
							where: { id: imageNumber },
							update: { url: filePath },
							create: { id: imageNumber, url: filePath }
						})
					} else {
						await prisma.newImage.upsert({
							where: { id: imageNumber },
							update: { url: filePath },
							create: { id: imageNumber, url: filePath }
						})
					}
					logger.info(`Добавлен путь: ${filePath}`)
				} catch (error) {
					logger.error(`Ошибка при добавлении ${filePath}:`, error)
				}
			}
		}
		
		logger.info('Все изображения добавлены в базу данных')
	} catch (error) {
		logger.error('Ошибка при обработке изображений:', error)
		throw error
	}
}



import { Composer } from 'telegraf'
import { monitoring } from '../../utils/monitoring.js'
import { logger } from '../../utils/logger.js'
import { adminMiddleware } from '../../utils/admin.js'

export const composer = new Composer()

composer.hears(/stats/i, async ctx => {
	try {
		// Проверяем права администратора
		await adminMiddleware(ctx, async () => {
			const stats = await monitoring.getStats()
			const health = await monitoring.checkBotHealth()

			const message = `📊 Статистика бота

⏱ Время работы: ${stats.uptime}
👥 Количество пользователей: ${stats.users.total}

📨 Статистика сообщений:
- Всего отправлено: ${stats.messages.total}
- Успешных: ${stats.messages.successful}
- Ошибок: ${stats.messages.failed}
- Процент успешности: ${stats.messages.successRate}%

❌ Ошибки:
- Заблокировавшие бота (403): ${stats.errors['403']}
- Превышение лимита (429): ${stats.errors['429']}
- Другие ошибки: ${stats.errors.other}

🔄 Состояние:
- Общий статус: ${health.status}
- База данных: ${health.database}
- ID бота: ${health.botInfo.id}
- Username: ${health.botInfo.username}

🕒 Время последней успешной отправки: ${new Date(
				stats.lastSuccessfulMessage
			).toLocaleString()}`

			await ctx.reply(message)
		})
	} catch (error) {
		logger.error('Error in stats command:', error)
		await ctx.reply('❌ Произошла ошибка при получении статистики')
	}
})

export const statsComposer = () => new Composer().use(composer)

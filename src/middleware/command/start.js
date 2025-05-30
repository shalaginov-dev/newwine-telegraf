import { Composer } from 'telegraf'
import { prisma } from '../../connection/prisma.js'
import { logger } from '../../utils/logger.js'

export const composer = new Composer()

composer.start(async ctx => {
	const userId = BigInt(ctx.from.id)

	try {
		await prisma.user.upsert({
			where: { userId },
			update: {},
			create: { userId },
		})
		await ctx.reply(`Спасибо, что вы с нами🎉
Теперь каждый день в 10.00 по мск
ожидайте новое послание 💌`)
		await ctx.deleteMessage()
	} catch (error) {
		logger.error('Ошибка:', error)
		await ctx.reply('Произошла ошибка.')
	}
})

export const startComposer = () => new Composer().use(composer)

import { Composer } from 'telegraf'
import { prisma } from '../../connection/prisma.js'
import { logger } from '../../utils/logger.js'

export const composer = new Composer()

composer.command('stop', async ctx => {
	const userId = BigInt(ctx.from.id)

	try {
		const user = await prisma.user.findUnique({
			where: { userId },
		})
		if (!user) {
			await ctx.reply('Вы не подписаны на рассылку.')
			await ctx.deleteMessage()
			return
		}
		await prisma.user.delete({
			where: { userId },
		})
		await ctx.reply(`Дорогой друг, вы всегда можете
возобновить получение посланий,
выбрав в меню команду «старт» 🙏🏻`)
		await ctx.deleteMessage()
	} catch (error) {
		logger.error('Ошибка при отписке:', error)
		await ctx.reply('Произошла ошибка при попытке отписаться.')
	}
})

export const stopComposer = () => new Composer().use(composer)

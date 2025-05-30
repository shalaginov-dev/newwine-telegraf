import { Composer, Markup } from 'telegraf'
import { detoxText } from '../../../public/detoxText.js'

export const composer = new Composer()

composer.command('detox', async ctx => {
	await ctx.reply(detoxText.firstPart, {
		reply_markup: Markup.inlineKeyboard([
			Markup.button.callback('Вторая часть', 'two'),
		]).reply_markup,
	})
	await ctx.deleteMessage()
})

composer.action('two', async ctx => {
	await ctx.reply(detoxText.secondPart, {
		reply_markup: Markup.inlineKeyboard([
			Markup.button.callback('Третья часть', 'three'),
		]).reply_markup,
	})
	await ctx.deleteMessage()
	await ctx.answerCbQuery()
})

composer.action('three', async ctx => {
	await ctx.reply(detoxText.thirdPart)
	await ctx.deleteMessage()
	await ctx.answerCbQuery()
})

export const detoxComposer = () => new Composer().use(composer)

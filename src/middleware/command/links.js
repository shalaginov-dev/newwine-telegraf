import { Composer, Markup } from 'telegraf'

export const composer = new Composer()

composer.command('links', async ctx => {
	ctx.reply('🍷      мы в других соцсетях     👇🏼', {
		reply_markup: Markup.inlineKeyboard([
			[
				Markup.button.url(
					'Instagram',
					'https://www.instagram.com/newwwwwine?igsh=ZDZwcnA3b2F0MGNl'
				),
			],
			[Markup.button.url('Telegram', 'https://t.me/newwwwwine')],
			[Markup.button.url('Pinterest', 'https://pin.it/2FqNG24KD')],
		]).reply_markup,
	})
	ctx.reply('🍷    также мы рекомендуем   👇🏼', {
		reply_markup: Markup.inlineKeyboard([
			[
				Markup.button.url(
					'Tg. Канал «Рождество»',
					'https://t.me/CHRISTmas_in_heart'
				),
			],
			[
				Markup.button.url(
					'Inst. «Творцы реальности»',
					'https://www.instagram.com/prophetscall?igsh=NnNvYTZpZWxkZjNo'
				),
			],
			[
				Markup.button.url(
					'Inst. «Реформация»',
					'https://www.instagram.com/reformation_spirit?igsh=eXNtZWh4cTN2NDFw'
				),
			],
		]).reply_markup,
	})
	await ctx.deleteMessage()
})

export const linksComposer = () => new Composer().use(composer)

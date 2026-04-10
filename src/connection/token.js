import { Telegraf } from 'telegraf'
import { ProxyAgent } from 'proxy-agent'
import 'dotenv/config'

const proxyUrl = process.env.ALL_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY
const agent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined

export const bot = new Telegraf(process.env.BOT_TOKEN, {
	telegram: { agent },
})

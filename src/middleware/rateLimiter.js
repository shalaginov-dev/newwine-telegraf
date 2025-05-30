import { Composer } from 'telegraf'
import { logger } from '../utils/logger.js'

// Хранилище для rate limiting
const userLimits = new Map()

// Конфигурация rate limiting
const RATE_LIMIT = {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 20, // максимум 20 запросов в минуту
    blockDuration: 5 * 60 * 1000 // блокировка на 5 минут
}

// Очистка старых записей
setInterval(() => {
    const now = Date.now()
    for (const [userId, data] of userLimits.entries()) {
        if (now - data.lastReset > RATE_LIMIT.windowMs) {
            userLimits.delete(userId)
        }
    }
}, RATE_LIMIT.windowMs)

export const rateLimiter = () => {
    return Composer.mount('message', async (ctx, next) => {
        const userId = ctx.from.id
        const now = Date.now()

        // Получаем или создаем данные для пользователя
        let userData = userLimits.get(userId) || {
            count: 0,
            lastReset: now,
            blockedUntil: 0
        }

        // Проверяем блокировку
        if (userData.blockedUntil > now) {
            const remainingTime = Math.ceil((userData.blockedUntil - now) / 1000 / 60)
            await ctx.reply(`Вы заблокированы на ${remainingTime} минут за превышение лимита запросов.`)
            return
        }

        // Сбрасываем счетчик если прошло окно
        if (now - userData.lastReset > RATE_LIMIT.windowMs) {
            userData = {
                count: 0,
                lastReset: now,
                blockedUntil: 0
            }
        }

        // Увеличиваем счетчик
        userData.count++

        // Проверяем превышение лимита
        if (userData.count > RATE_LIMIT.maxRequests) {
            userData.blockedUntil = now + RATE_LIMIT.blockDuration
            userLimits.set(userId, userData)
            
            logger.warn('Rate limit exceeded', {
                userId,
                count: userData.count,
                blockedUntil: new Date(userData.blockedUntil)
            })
            
            await ctx.reply(`Вы превысили лимит запросов. Блокировка на ${RATE_LIMIT.blockDuration / 1000 / 60} минут.`)
            return
        }

        // Сохраняем обновленные данные
        userLimits.set(userId, userData)
        
        // Логируем при приближении к лимиту
        if (userData.count > RATE_LIMIT.maxRequests * 0.8) {
            logger.info('Approaching rate limit', {
                userId,
                count: userData.count,
                maxRequests: RATE_LIMIT.maxRequests
            })
        }

        return next()
    })
} 
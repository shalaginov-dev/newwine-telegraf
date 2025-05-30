import { logger } from './logger.js'

// Получение списка администраторов из переменных окружения
const getAdminIds = () => {
    const adminIds = process.env.ADMIN_IDS
    if (!adminIds) {
        logger.error('ADMIN_IDS not set in environment variables')
        return []
    }
    return adminIds.split(',').map(id => id.trim())
}

// Проверка является ли пользователь администратором
export const isAdmin = (userId) => {
    if (!userId) return false
    const adminIds = getAdminIds()
    return adminIds.includes(userId.toString())
}

// Middleware для проверки прав администратора
export const adminMiddleware = async (ctx, next) => {
    const userId = ctx.from?.id
    if (!userId) {
        logger.warn('Unauthorized access attempt without user ID')
        await ctx.reply('Доступ запрещен')
        return
    }

    if (!isAdmin(userId)) {
        logger.warn('Unauthorized access attempt', { userId })
        await ctx.reply('У вас нет прав для выполнения этой команды')
        return
    }

    return next()
}

// Логирование действий администратора
export const logAdminAction = (userId, action, details = {}) => {
    logger.info('Admin action', {
        userId,
        action,
        ...details
    })
} 
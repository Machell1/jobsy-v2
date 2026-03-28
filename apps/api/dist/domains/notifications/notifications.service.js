"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = listNotifications;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
exports.getUnreadCount = getUnreadCount;
exports.registerPushToken = registerPushToken;
exports.createNotification = createNotification;
const database_1 = require("@jobsy/database");
const error_handler_1 = require("../../middleware/error-handler");
async function listNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
        database_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        database_1.prisma.notification.count({ where: { userId } }),
    ]);
    return {
        data: notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
async function markAsRead(id, userId) {
    const notification = await database_1.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
        throw new error_handler_1.AppError('NOT_FOUND', 404, 'Notification not found');
    }
    if (notification.userId !== userId) {
        throw new error_handler_1.AppError('FORBIDDEN', 403, 'You do not own this notification');
    }
    return database_1.prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });
}
async function markAllAsRead(userId) {
    const result = await database_1.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
    return { updated: result.count };
}
async function getUnreadCount(userId) {
    const count = await database_1.prisma.notification.count({
        where: { userId, isRead: false },
    });
    return { count };
}
async function registerPushToken(userId, token, platform) {
    return database_1.prisma.pushToken.upsert({
        where: { token },
        create: { userId, token, platform },
        update: { userId, platform },
    });
}
async function createNotification(userId, type, title, body, data) {
    return database_1.prisma.notification.create({
        data: {
            userId,
            type,
            title,
            body,
            data: data ?? undefined,
        },
    });
}
//# sourceMappingURL=notifications.service.js.map
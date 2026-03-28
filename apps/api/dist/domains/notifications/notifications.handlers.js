"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = listNotifications;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.getUnreadCount = getUnreadCount;
exports.registerPushToken = registerPushToken;
const notificationsService = __importStar(require("./notifications.service"));
const error_handler_1 = require("../../middleware/error-handler");
async function listNotifications(req, res, next) {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const result = await notificationsService.listNotifications(req.user.userId, page, limit);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    }
    catch (err) {
        next(err);
    }
}
async function markRead(req, res, next) {
    try {
        const notification = await notificationsService.markAsRead(req.params.id, req.user.userId);
        res.json({ success: true, data: notification });
    }
    catch (err) {
        next(err);
    }
}
async function markAllRead(req, res, next) {
    try {
        const result = await notificationsService.markAllAsRead(req.user.userId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getUnreadCount(req, res, next) {
    try {
        const result = await notificationsService.getUnreadCount(req.user.userId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function registerPushToken(req, res, next) {
    try {
        const { token, platform } = req.body;
        if (!token || !platform) {
            throw new error_handler_1.AppError('VALIDATION_ERROR', 400, 'Token and platform are required');
        }
        const pushToken = await notificationsService.registerPushToken(req.user.userId, token, platform);
        res.status(201).json({ success: true, data: pushToken });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=notifications.handlers.js.map
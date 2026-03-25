import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';
import { AppError } from '../../middleware/error-handler';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await notificationsService.listNotifications(req.user!.userId, page, limit);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await notificationsService.markAsRead(req.params.id as string, req.user!.userId);
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationsService.markAllAsRead(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationsService.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function registerPushToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, platform } = req.body;

    if (!token || !platform) {
      throw new AppError('VALIDATION_ERROR', 400, 'Token and platform are required');
    }

    const pushToken = await notificationsService.registerPushToken(
      req.user!.userId,
      token,
      platform,
    );
    res.status(201).json({ success: true, data: pushToken });
  } catch (err) {
    next(err);
  }
}

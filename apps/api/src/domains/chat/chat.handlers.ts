import { Request, Response, NextFunction } from 'express';
import * as service from './chat.service';

export async function getToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = service.generateToken(req.user!.userId);

    res.json({
      success: true,
      data: { token, userId: req.user!.userId },
    });
  } catch (err) {
    next(err);
  }
}

export async function createChannel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, serviceId } = req.validated;
    const channel = await service.createOrGetChannel(
      req.user!.userId,
      userId,
      serviceId,
    );

    res.status(201).json({ success: true, data: channel });
  } catch (err) {
    next(err);
  }
}

export async function listChannels(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const channels = await service.listChannels(req.user!.userId);

    res.json({ success: true, data: channels });
  } catch (err) {
    next(err);
  }
}

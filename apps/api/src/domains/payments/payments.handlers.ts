import { Request, Response, NextFunction } from 'express';
import * as service from './payments.service';

export async function getPaymentHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const result = await service.getPaymentHistory(
      req.user!.userId,
      req.user!.role,
      page,
      limit,
    );

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getEarnings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.getEarnings(req.user!.userId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

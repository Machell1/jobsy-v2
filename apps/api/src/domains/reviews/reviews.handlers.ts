import { Request, Response, NextFunction } from 'express';
import * as service from './reviews.service';

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const review = await service.createReview(req.user!.userId, req.validated);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function getServiceReviews(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceId = req.params.serviceId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await service.getServiceReviews(serviceId, page, limit);

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getUserReviews(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.params.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await service.getUserReviews(userId, page, limit);

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    const review = await service.updateReview(id, req.user!.userId, req.validated);

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    await service.deleteReview(id);

    res.json({ success: true, message: 'Review hidden successfully' });
  } catch (err) {
    next(err);
  }
}

export async function reportReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    const { reason } = req.validated;
    const result = await service.reportReview(id, req.user!.userId, reason);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

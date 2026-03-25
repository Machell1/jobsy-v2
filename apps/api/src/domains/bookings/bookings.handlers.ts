import { Request, Response, NextFunction } from 'express';
import * as bookingsService from './bookings.service';

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingsService.createBooking(
      req.user!.userId,
      req.validated || req.body,
    );
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status } = req.query;
    const result = await bookingsService.listBookings(
      req.user!.userId,
      req.user!.role,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      status as string | undefined,
    );
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingsService.getBooking(req.params.id as string, req.user!.userId);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.validated || req.body;
    const booking = await bookingsService.updateStatus(
      req.params.id as string,
      req.user!.userId,
      status,
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = req.validated || req.body || {};
    const booking = await bookingsService.cancelBooking(
      req.params.id as string,
      req.user!.userId,
      reason,
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

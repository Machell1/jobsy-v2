import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const dashboard = await adminService.getDashboard();
    res.json({ success: true, data: dashboard });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await adminService.listUsers(page, limit, role, search);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.updateUser(req.params.id as string, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const featured = req.query.featured !== undefined
      ? req.query.featured === 'true'
      : undefined;
    const active = req.query.active !== undefined
      ? req.query.active === 'true'
      : undefined;

    const result = await adminService.listServices(page, limit, featured, active);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await adminService.updateService(req.params.id as string, req.body);
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const status = req.query.status as string | undefined;

    const result = await adminService.listBookings(page, limit, status);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentReport(req: Request, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const report = await adminService.getPaymentReport(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

export async function getReportedReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await adminService.getReportedReviews(page, limit);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await adminService.updateReview(req.params.id as string, req.body);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await adminService.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
}

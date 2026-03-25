import { Request, Response, NextFunction } from 'express';
import * as servicesService from './services.service';

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await servicesService.listServices(req.validated || req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await servicesService.getService(req.params.id as string);
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await servicesService.createService(req.user!.userId, req.validated || req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await servicesService.updateService(
      req.params.id as string,
      req.user!.userId,
      req.validated || req.body,
    );
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    await servicesService.deleteService(req.params.id as string, req.user!.userId);
    res.json({ success: true, data: { message: 'Service deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await servicesService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const services = await servicesService.getFeatured(limit);
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
}

export async function getNearby(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lng, radius, limit } = req.validated || req.query;
    const services = await servicesService.getNearby(
      Number(lat),
      Number(lng),
      radius ? Number(radius) : 25,
      limit ? Number(limit) : 20,
    );
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
}

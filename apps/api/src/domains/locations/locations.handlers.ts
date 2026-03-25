import { Request, Response, NextFunction } from 'express';
import * as locationsService from './locations.service';
import { AppError } from '../../middleware/error-handler';

export async function geocode(req: Request, res: Response, next: NextFunction) {
  try {
    const address = req.query.address as string;
    if (!address) {
      throw new AppError('MISSING_PARAM', 400, 'Address query parameter is required');
    }

    const results = await locationsService.forwardGeocode(address);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function reverseGeocode(req: Request, res: Response, next: NextFunction) {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError('MISSING_PARAM', 400, 'Valid lat and lng query parameters are required');
    }

    const result = await locationsService.reverseGeocode(lat, lng);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listParishes(_req: Request, res: Response, next: NextFunction) {
  try {
    const parishes = locationsService.getParishes();
    res.json({ success: true, data: parishes });
  } catch (err) {
    next(err);
  }
}

export async function autocomplete(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string;
    if (!query) {
      throw new AppError('MISSING_PARAM', 400, 'Query parameter q is required');
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const results = await locationsService.autocomplete(query, limit);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

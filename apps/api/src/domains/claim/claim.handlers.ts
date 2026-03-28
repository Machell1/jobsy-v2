import { Request, Response, NextFunction } from 'express';
import * as service from './claim.service';

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query.q as string | undefined;
    const parish = req.query.parish as string | undefined;
    const category = req.query.category as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await service.searchUnclaimed({ q, parish, category, page, limit });
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getUnclaimedProfile(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function requestCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { unclaimedProviderId, contactMethod = 'email', contactValue } = req.body;
    if (!unclaimedProviderId || !contactValue) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'unclaimedProviderId and contactValue are required' },
      });
      return;
    }
    const data = await service.requestClaimCode(unclaimedProviderId, contactMethod, contactValue);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function verifyCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { unclaimedProviderId, code } = req.body;
    if (!unclaimedProviderId || !code) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'unclaimedProviderId and code are required' },
      });
      return;
    }
    const data = await service.verifyClaimCode(unclaimedProviderId, code);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const { claimToken, password, name, phone } = req.body;
    if (!claimToken || !password) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'claimToken and password are required' },
      });
      return;
    }
    const data = await service.completeClaim({ claimToken, password, name, phone });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getClaimStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function claimWithCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, password, name } = req.body;
    if (!code || !password) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'code and password are required' },
      });
      return;
    }
    const data = await service.claimWithCode(code, password, name);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function importProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const entries = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Body must be a non-empty array' },
      });
      return;
    }
    const data = await service.bulkImport(entries);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

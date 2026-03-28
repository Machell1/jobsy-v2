import { Request, Response, NextFunction } from 'express';
import * as service from './ads.service';

export async function getPromotedListings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getPromotedListings();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createPromotedListing(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { serviceId, planType = 'basic', durationDays = 30 } = req.body;
    if (!serviceId) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'serviceId is required' } });
      return;
    }
    const data = await service.createPromotedListing(
      req.user!.userId,
      serviceId,
      planType,
      Number(durationDays),
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSubscription(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getSubscription(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function upsertSubscription(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { plan } = req.body;
    if (!plan || !['free', 'pro', 'business'].includes(plan)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'plan must be free, pro, or business' } });
      return;
    }
    const data = await service.upsertSubscription(req.user!.userId, plan);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function trackClick(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { affiliateCode, targetUrl, source } = req.body;
    const providerId = req.body.providerId as string | undefined;
    const data = await service.trackClick(providerId, affiliateCode, targetUrl ?? '', source);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getCampaigns(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, targetUrl, budget = 0 } = req.body;
    if (!title || !targetUrl) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'title and targetUrl are required' } });
      return;
    }
    const data = await service.createCampaign(req.user!.userId, title, targetUrl, Number(budget));
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

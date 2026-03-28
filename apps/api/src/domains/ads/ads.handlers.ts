import { Request, Response, NextFunction } from 'express';
import * as service from './ads.service';

export async function getSubscriptionPlans(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json({ success: true, data: service.SUBSCRIPTION_PLANS });
  } catch (err) {
    next(err);
  }
}

export async function getPromotedListings(
  _req: Request,
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
    const { serviceId, tier = 'basic', durationDays = 30, amountPaid = 0, paymentRef } = req.body;
    if (!serviceId) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'serviceId is required' } });
      return;
    }
    const data = await service.createPromotedListing(
      req.user!.userId,
      serviceId,
      tier,
      Number(durationDays),
      Number(amountPaid),
      paymentRef,
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
    const { plan, amountPaid, paymentRef } = req.body;
    if (!plan || !['free', 'pro', 'business'].includes(plan)) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'plan must be free, pro, or business' } });
      return;
    }
    const data = await service.upsertSubscription(req.user!.userId, plan, amountPaid, paymentRef);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getBanners(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const placement = (req.query.placement as string) || 'homepage_banner';
    const data = await service.getBanners(placement);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function recordImpression(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await service.recordImpression(req.params.id as string);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function recordClick(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await service.recordClick(req.params.id as string);
    res.json({ success: true });
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
    const { name, advertiser, imageUrl, linkUrl, placement, startsAt, expiresAt } = req.body;
    if (!name || !advertiser || !linkUrl || !placement || !startsAt || !expiresAt) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'name, advertiser, linkUrl, placement, startsAt, expiresAt are required' } });
      return;
    }
    const data = await service.createCampaign({
      name, advertiser, imageUrl, linkUrl, placement,
      startsAt: new Date(startsAt),
      expiresAt: new Date(expiresAt),
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

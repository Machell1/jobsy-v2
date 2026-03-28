import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as handlers from './ads.handlers';

const router = Router();

// Public
router.get('/subscription/plans', handlers.getSubscriptionPlans);
router.get('/promoted', handlers.getPromotedListings);
router.get('/banners', handlers.getBanners);
router.post('/banners/:id/impression', handlers.recordImpression);
router.post('/banners/:id/click', handlers.recordClick);

// Provider: promoted listings
router.post('/promote', requireAuth, requireRole('PROVIDER'), handlers.createPromotedListing);

// Provider: subscription
router.get('/subscription', requireAuth, requireRole('PROVIDER'), handlers.getSubscription);
router.post('/subscription', requireAuth, requireRole('PROVIDER'), handlers.upsertSubscription);

// Admin: manage ad campaigns
router.post('/campaigns', requireAuth, requireRole('ADMIN'), handlers.createCampaign);

export default router;

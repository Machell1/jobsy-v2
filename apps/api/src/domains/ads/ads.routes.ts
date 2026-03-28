import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as handlers from './ads.handlers';

const router = Router();

// Public: list active promoted listings
router.get('/promoted', handlers.getPromotedListings);

// Public: track affiliate/ad click
router.post('/track-click', handlers.trackClick);

// Provider: manage promoted listings
router.post('/promote', requireAuth, requireRole('PROVIDER'), handlers.createPromotedListing);

// Provider: subscription
router.get('/subscription', requireAuth, requireRole('PROVIDER'), handlers.getSubscription);
router.post('/subscription', requireAuth, requireRole('PROVIDER'), handlers.upsertSubscription);

// Provider: ad campaigns
router.get('/campaigns', requireAuth, requireRole('PROVIDER'), handlers.getCampaigns);
router.post('/campaigns', requireAuth, requireRole('PROVIDER'), handlers.createCampaign);

export default router;

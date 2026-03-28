import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as handlers from './claim.handlers';

const router = Router();

// Public — no auth needed
router.get('/search', handlers.search);
router.get('/profile/:id', handlers.getProfile);
router.post('/request-code', handlers.requestCode);
router.post('/verify-code', handlers.verifyCode);
router.post('/complete', handlers.complete);
router.post('/claim-with-code', handlers.claimWithCode);

// Admin only
router.get('/stats', requireAuth, requireRole('ADMIN'), handlers.getStats);
router.post('/import', requireAuth, requireRole('ADMIN'), handlers.importProviders);

export default router;

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as handlers from './notifications.handlers';

const router = Router();

router.get('/', requireAuth, handlers.listNotifications);
router.patch('/:id/read', requireAuth, handlers.markRead);
router.patch('/read-all', requireAuth, handlers.markAllRead);
router.get('/unread-count', requireAuth, handlers.getUnreadCount);
router.post('/push-token', requireAuth, handlers.registerPushToken);

export default router;

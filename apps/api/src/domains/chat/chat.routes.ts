import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { CreateChannelSchema } from '@jobsy/shared';
import * as handlers from './chat.handlers';

const router = Router();

router.post('/token', requireAuth, handlers.getToken);

router.post(
  '/channel',
  requireAuth,
  validate(CreateChannelSchema),
  handlers.createChannel,
);

router.get('/channels', requireAuth, handlers.listChannels);

export default router;

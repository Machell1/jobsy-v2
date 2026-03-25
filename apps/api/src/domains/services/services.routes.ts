import { Router } from 'express';
import {
  ServiceSearchSchema,
  CreateServiceSchema,
  UpdateServiceSchema,
} from '@jobsy/shared';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as handlers from './services.handlers';

const router = Router();

router.get('/', validate(ServiceSearchSchema, 'query'), handlers.listServices);
router.get('/categories', handlers.getCategories);
router.get('/featured', handlers.getFeatured);
router.get('/nearby', validate(ServiceSearchSchema, 'query'), handlers.getNearby);
router.get('/:id', handlers.getService);

router.post(
  '/',
  requireAuth,
  requireRole('PROVIDER'),
  validate(CreateServiceSchema),
  handlers.createService,
);

router.patch(
  '/:id',
  requireAuth,
  validate(UpdateServiceSchema),
  handlers.updateService,
);

router.delete('/:id', requireAuth, handlers.deleteService);

export default router;

import { Router } from 'express';
import * as handlers from './locations.handlers';

const router = Router();

router.get('/geocode', handlers.geocode);
router.get('/reverse', handlers.reverseGeocode);
router.get('/parishes', handlers.listParishes);
router.get('/autocomplete', handlers.autocomplete);

export default router;

import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth';
import * as handlers from './media.handlers';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post('/upload', requireAuth, upload.single('file'), handlers.uploadImage);
router.post('/upload-multiple', requireAuth, upload.array('files', 10), handlers.uploadMultiple);
router.delete('/:publicId', requireAuth, handlers.deleteImage);

export default router;

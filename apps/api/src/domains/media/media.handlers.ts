import { Request, Response, NextFunction } from 'express';
import * as mediaService from './media.service';
import { AppError } from '../../middleware/error-handler';

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError('NO_FILE', 400, 'No file provided');
    }

    const folder = (req.query.folder as string) || 'jobsy/general';
    const result = await mediaService.uploadImage(req.file, folder);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function uploadMultiple(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('NO_FILES', 400, 'No files provided');
    }

    const folder = (req.query.folder as string) || 'jobsy/general';
    const results = await mediaService.uploadMultiple(files, folder);

    res.status(201).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const publicId = req.params.publicId as string;
    if (!publicId) {
      throw new AppError('MISSING_PARAM', 400, 'Public ID is required');
    }

    await mediaService.deleteImage(publicId);

    res.json({ success: true, data: { message: 'Image deleted' } });
  } catch (err) {
    next(err);
  }
}

import { cloudinary } from '../../lib/cloudinary';
import { AppError } from '../../middleware/error-handler';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

function validateFile(file: Express.Multer.File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError(
      'INVALID_FILE_TYPE',
      400,
      'Only JPEG, PNG, and WebP images are allowed',
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(
      'FILE_TOO_LARGE',
      400,
      'File size must not exceed 10MB',
    );
  }
}

export async function uploadImage(
  file: Express.Multer.File,
  folder: string,
): Promise<UploadResult> {
  validateFile(file);

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(file.buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function uploadMultiple(
  files: Express.Multer.File[],
  folder: string,
): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

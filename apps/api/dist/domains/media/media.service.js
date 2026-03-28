"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.uploadMultiple = uploadMultiple;
exports.deleteImage = deleteImage;
const cloudinary_1 = require("../../lib/cloudinary");
const error_handler_1 = require("../../middleware/error-handler");
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
function validateFile(file) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new error_handler_1.AppError('INVALID_FILE_TYPE', 400, 'Only JPEG, PNG, and WebP images are allowed');
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new error_handler_1.AppError('FILE_TOO_LARGE', 400, 'File size must not exceed 10MB');
    }
}
async function uploadImage(file, folder) {
    validateFile(file);
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder,
            transformation: [
                { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
        }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
        stream.end(file.buffer);
    });
    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
    };
}
async function uploadMultiple(files, folder) {
    return Promise.all(files.map((file) => uploadImage(file, folder)));
}
async function deleteImage(publicId) {
    await cloudinary_1.cloudinary.uploader.destroy(publicId);
}
//# sourceMappingURL=media.service.js.map
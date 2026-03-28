"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.uploadMultiple = uploadMultiple;
exports.deleteImage = deleteImage;
const mediaService = __importStar(require("./media.service"));
const error_handler_1 = require("../../middleware/error-handler");
async function uploadImage(req, res, next) {
    try {
        if (!req.file) {
            throw new error_handler_1.AppError('NO_FILE', 400, 'No file provided');
        }
        const folder = req.query.folder || 'jobsy/general';
        const result = await mediaService.uploadImage(req.file, folder);
        res.status(201).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function uploadMultiple(req, res, next) {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            throw new error_handler_1.AppError('NO_FILES', 400, 'No files provided');
        }
        const folder = req.query.folder || 'jobsy/general';
        const results = await mediaService.uploadMultiple(files, folder);
        res.status(201).json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
}
async function deleteImage(req, res, next) {
    try {
        const publicId = req.params.publicId;
        if (!publicId) {
            throw new error_handler_1.AppError('MISSING_PARAM', 400, 'Public ID is required');
        }
        await mediaService.deleteImage(publicId);
        res.json({ success: true, data: { message: 'Image deleted' } });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=media.handlers.js.map
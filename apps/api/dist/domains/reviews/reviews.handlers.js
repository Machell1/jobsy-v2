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
exports.createReview = createReview;
exports.getServiceReviews = getServiceReviews;
exports.getUserReviews = getUserReviews;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
exports.reportReview = reportReview;
const service = __importStar(require("./reviews.service"));
async function createReview(req, res, next) {
    try {
        const review = await service.createReview(req.user.userId, req.validated);
        res.status(201).json({ success: true, data: review });
    }
    catch (err) {
        next(err);
    }
}
async function getServiceReviews(req, res, next) {
    try {
        const serviceId = req.params.serviceId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const result = await service.getServiceReviews(serviceId, page, limit);
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function getUserReviews(req, res, next) {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const result = await service.getUserReviews(userId, page, limit);
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
async function updateReview(req, res, next) {
    try {
        const id = req.params.id;
        const review = await service.updateReview(id, req.user.userId, req.validated);
        res.json({ success: true, data: review });
    }
    catch (err) {
        next(err);
    }
}
async function deleteReview(req, res, next) {
    try {
        const id = req.params.id;
        await service.deleteReview(id);
        res.json({ success: true, message: 'Review hidden successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function reportReview(req, res, next) {
    try {
        const id = req.params.id;
        const { reason } = req.validated;
        const result = await service.reportReview(id, req.user.userId, reason);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=reviews.handlers.js.map
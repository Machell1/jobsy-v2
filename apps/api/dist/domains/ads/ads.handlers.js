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
exports.getPromotedListings = getPromotedListings;
exports.createPromotedListing = createPromotedListing;
exports.getSubscription = getSubscription;
exports.upsertSubscription = upsertSubscription;
exports.trackClick = trackClick;
exports.getCampaigns = getCampaigns;
exports.createCampaign = createCampaign;
const service = __importStar(require("./ads.service"));
async function getPromotedListings(req, res, next) {
    try {
        const data = await service.getPromotedListings();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function createPromotedListing(req, res, next) {
    try {
        const { serviceId, planType = 'basic', durationDays = 30 } = req.body;
        if (!serviceId) {
            res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'serviceId is required' } });
            return;
        }
        const data = await service.createPromotedListing(req.user.userId, serviceId, planType, Number(durationDays));
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function getSubscription(req, res, next) {
    try {
        const data = await service.getSubscription(req.user.userId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function upsertSubscription(req, res, next) {
    try {
        const { plan } = req.body;
        if (!plan || !['free', 'pro', 'business'].includes(plan)) {
            res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'plan must be free, pro, or business' } });
            return;
        }
        const data = await service.upsertSubscription(req.user.userId, plan);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function trackClick(req, res, next) {
    try {
        const { affiliateCode, targetUrl, source } = req.body;
        const providerId = req.body.providerId;
        const data = await service.trackClick(providerId, affiliateCode, targetUrl ?? '', source);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function getCampaigns(req, res, next) {
    try {
        const data = await service.getCampaigns(req.user.userId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function createCampaign(req, res, next) {
    try {
        const { title, targetUrl, budget = 0 } = req.body;
        if (!title || !targetUrl) {
            res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'title and targetUrl are required' } });
            return;
        }
        const data = await service.createCampaign(req.user.userId, title, targetUrl, Number(budget));
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=ads.handlers.js.map
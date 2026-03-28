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
exports.getSubscriptionPlans = getSubscriptionPlans;
exports.getPromotedListings = getPromotedListings;
exports.createPromotedListing = createPromotedListing;
exports.getSubscription = getSubscription;
exports.upsertSubscription = upsertSubscription;
exports.getBanners = getBanners;
exports.recordImpression = recordImpression;
exports.recordClick = recordClick;
exports.createCampaign = createCampaign;
const service = __importStar(require("./ads.service"));
async function getSubscriptionPlans(_req, res, next) {
    try {
        res.json({ success: true, data: service.SUBSCRIPTION_PLANS });
    }
    catch (err) {
        next(err);
    }
}
async function getPromotedListings(_req, res, next) {
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
        const { serviceId, tier = 'basic', durationDays = 30, amountPaid = 0, paymentRef } = req.body;
        if (!serviceId) {
            res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'serviceId is required' } });
            return;
        }
        const data = await service.createPromotedListing(req.user.userId, serviceId, tier, Number(durationDays), Number(amountPaid), paymentRef);
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
        const { plan, amountPaid, paymentRef } = req.body;
        if (!plan || !['free', 'pro', 'business'].includes(plan)) {
            res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'plan must be free, pro, or business' } });
            return;
        }
        const data = await service.upsertSubscription(req.user.userId, plan, amountPaid, paymentRef);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function getBanners(req, res, next) {
    try {
        const placement = req.query.placement || 'homepage_banner';
        const data = await service.getBanners(placement);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function recordImpression(req, res, next) {
    try {
        await service.recordImpression(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
async function recordClick(req, res, next) {
    try {
        await service.recordClick(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
async function createCampaign(req, res, next) {
    try {
        const { name, advertiser, imageUrl, linkUrl, placement, startsAt, expiresAt } = req.body;
        if (!name || !advertiser || !linkUrl || !placement || !startsAt || !expiresAt) {
            res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'name, advertiser, linkUrl, placement, startsAt, expiresAt are required' } });
            return;
        }
        const data = await service.createCampaign({
            name, advertiser, imageUrl, linkUrl, placement,
            startsAt: new Date(startsAt),
            expiresAt: new Date(expiresAt),
        });
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=ads.handlers.js.map
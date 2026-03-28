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
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const handlers = __importStar(require("./ads.handlers"));
const router = (0, express_1.Router)();
// Public
router.get('/subscription/plans', handlers.getSubscriptionPlans);
router.get('/promoted', handlers.getPromotedListings);
router.get('/banners', handlers.getBanners);
router.post('/banners/:id/impression', handlers.recordImpression);
router.post('/banners/:id/click', handlers.recordClick);
// Provider: promoted listings
router.post('/promote', auth_1.requireAuth, (0, auth_1.requireRole)('PROVIDER'), handlers.createPromotedListing);
// Provider: subscription
router.get('/subscription', auth_1.requireAuth, (0, auth_1.requireRole)('PROVIDER'), handlers.getSubscription);
router.post('/subscription', auth_1.requireAuth, (0, auth_1.requireRole)('PROVIDER'), handlers.upsertSubscription);
// Admin: manage ad campaigns
router.post('/campaigns', auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN'), handlers.createCampaign);
exports.default = router;
//# sourceMappingURL=ads.routes.js.map
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
const shared_1 = require("@jobsy/shared");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const handlers = __importStar(require("./users.handlers"));
const router = (0, express_1.Router)();
router.get('/profile', auth_1.requireAuth, handlers.getProfile);
router.patch('/profile', auth_1.requireAuth, (0, validate_1.validate)(shared_1.UpdateProfileSchema), handlers.updateProfile);
router.get('/dashboard', auth_1.requireAuth, handlers.getDashboard);
router.patch('/avatar', auth_1.requireAuth, handlers.updateAvatar);
router.patch('/settings', auth_1.requireAuth, handlers.updateSettings);
router.post('/provider-verification', auth_1.requireAuth, (0, auth_1.requireRole)('PROVIDER'), handlers.submitVerification);
// Parameterized routes last to avoid conflicts
router.get('/:id', handlers.getPublicProfile);
router.get('/:id/services', handlers.getUserServices);
router.get('/:id/reviews', handlers.getUserReviews);
exports.default = router;
//# sourceMappingURL=users.routes.js.map
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
const handlers = __importStar(require("./admin.handlers"));
const router = (0, express_1.Router)();
// All admin routes require authentication + ADMIN role
router.use(auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN'));
router.get('/dashboard', handlers.getDashboard);
router.get('/users', handlers.listUsers);
router.patch('/users/:id', handlers.updateUser);
router.get('/services', handlers.listServices);
router.patch('/services/:id', handlers.updateService);
router.get('/bookings', handlers.listBookings);
router.get('/payments', handlers.getPaymentReport);
router.get('/reviews/reported', handlers.getReportedReviews);
router.patch('/reviews/:id', handlers.updateReview);
router.get('/analytics', handlers.getAnalytics);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map
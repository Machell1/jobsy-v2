"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalLimiter = exports.authLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Create a rate limiter with the given window and max requests.
 */
function createRateLimiter(windowMs, max) {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: 'Too many requests, please try again later',
            },
        },
    });
}
/** 5 requests per minute — use on auth routes (login, register, reset). */
exports.authLimiter = createRateLimiter(60 * 1000, 5);
/** 100 requests per minute — general API endpoints. */
exports.generalLimiter = createRateLimiter(60 * 1000, 100);
//# sourceMappingURL=rate-limit.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const sentry_1 = require("./lib/sentry");
const error_handler_1 = require("./middleware/error-handler");
const rate_limit_1 = require("./middleware/rate-limit");
// ---------------------------------------------------------------------------
// Sentry — must init before anything else
// ---------------------------------------------------------------------------
(0, sentry_1.initSentry)();
// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = (0, express_1.default)();
exports.app = app;
// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rate_limit_1.generalLimiter);
// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ---------------------------------------------------------------------------
// Domain routes
// Each domain is expected to export a default Router from its routes file.
// Routes are lazy-imported so the server boots even if a domain is WIP.
// ---------------------------------------------------------------------------
const domainRoutes = [
    { path: '/api/auth', module: './domains/auth/auth.routes' },
    { path: '/api/users', module: './domains/users/users.routes' },
    { path: '/api/services', module: './domains/services/services.routes' },
    { path: '/api/bookings', module: './domains/bookings/bookings.routes' },
    { path: '/api/payments', module: './domains/payments/payments.routes' },
    { path: '/api/reviews', module: './domains/reviews/reviews.routes' },
    { path: '/api/chat', module: './domains/chat/chat.routes' },
    { path: '/api/notifications', module: './domains/notifications/notifications.routes' },
    { path: '/api/media', module: './domains/media/media.routes' },
    { path: '/api/locations', module: './domains/locations/locations.routes' },
    { path: '/api/admin', module: './domains/admin/admin.routes' },
    { path: '/api/ads', module: './domains/ads/ads.routes' },
];
for (const route of domainRoutes) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(route.module);
        app.use(route.path, mod.default ?? mod.router ?? mod);
    }
    catch (err) {
        console.warn(`[boot] Skipping ${route.path} — module not yet implemented`);
    }
}
// ---------------------------------------------------------------------------
// Sentry error handler (must be before our custom one)
// ---------------------------------------------------------------------------
sentry_1.Sentry.setupExpressErrorHandler?.(app);
// ---------------------------------------------------------------------------
// Global error handler — must be last
// ---------------------------------------------------------------------------
app.use(error_handler_1.errorHandler);
// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '4000', 10);
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`[server] Jobsy API running on port ${PORT}`);
    });
}
//# sourceMappingURL=server.js.map
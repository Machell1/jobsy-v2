import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { initSentry, Sentry } from './lib/sentry';
import { errorHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limit';

// ---------------------------------------------------------------------------
// Sentry — must init before anything else
// ---------------------------------------------------------------------------
initSentry();

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

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
const domainRoutes: Array<{ path: string; module: string }> = [
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
  { path: '/api/claim', module: './domains/claim/claim.routes' },
];

for (const route of domainRoutes) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(route.module);
    app.use(route.path, mod.default ?? mod.router ?? mod);
  } catch (err) {
    console.warn(`[boot] Skipping ${route.path} — module not yet implemented`);
  }
}

// ---------------------------------------------------------------------------
// Sentry error handler (must be before our custom one)
// ---------------------------------------------------------------------------
Sentry.setupExpressErrorHandler?.(app);

// ---------------------------------------------------------------------------
// Global error handler — must be last
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '4000', 10);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[server] Jobsy API running on port ${PORT}`);
  });
}

export { app };

import * as Sentry from '@sentry/node';

/**
 * Initialise Sentry error tracking.
 * Call once at application startup, before any other middleware.
 */
export function initSentry(): void {
  if (!process.env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not set — Sentry is disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}

export { Sentry };

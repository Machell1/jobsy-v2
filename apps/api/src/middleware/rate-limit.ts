import rateLimit, { type Options } from 'express-rate-limit';

/**
 * Create a rate limiter with the given window and max requests.
 */
export function createRateLimiter(windowMs: number, max: number) {
  return rateLimit({
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
  } satisfies Partial<Options>);
}

/** 5 requests per minute — use on auth routes (login, register, reset). */
export const authLimiter = createRateLimiter(60 * 1000, 5);

/** 100 requests per minute — general API endpoints. */
export const generalLimiter = createRateLimiter(60 * 1000, 100);

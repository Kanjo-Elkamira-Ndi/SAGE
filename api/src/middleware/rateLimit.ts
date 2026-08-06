import { rateLimit } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { env } from '../config/env';

export interface ApiRateLimitOptions {
  windowMs: number;
  max: number;
  code?: string;
  message?: string;
}

/**
 * Shared per-IP rate limiter that responds with the standard SAGE error shape
 * (`{ success: false, error: { code, message } }`) and a 429 status. Disabled
 * in the test env so app-level tests are never tripped up.
 */
export function apiRateLimit({
  windowMs,
  max,
  code = 'TOO_MANY_REQUESTS',
  message = 'Too many requests. Please try again later.',
}: ApiRateLimitOptions): RequestHandler {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    message: {
      success: false,
      error: { code, message },
    },
  });
}

/** Strict limiter for credential-stuffing-prone auth endpoints (default 10 req / 15 min / IP). */
export const authRateLimiter = apiRateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  code: 'TOO_MANY_REQUESTS',
  message: 'Too many auth attempts. Please wait a few minutes and try again.',
});

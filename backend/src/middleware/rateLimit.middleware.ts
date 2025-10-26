// middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';

/**
 * Basic IP based rate limiter.
 * Use a reverse proxy like Nginx for real world deployments.
 */
export const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests' },
});

/**
 * Stricter limiter for auth sensitive endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests' },
});

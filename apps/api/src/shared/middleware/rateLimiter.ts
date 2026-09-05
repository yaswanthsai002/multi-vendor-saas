import { AppError } from '../errors/AppError.js';

import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests. Please try again later.' } = options;
  const ipLogs = new Map<string, number[]>();

  // Periodic cleanup every 5 minutes to prevent memory leak from inactive IPs
  const cleanup = setInterval(
    () => {
      const threshold = Date.now() - windowMs;
      for (const [ip, timestamps] of ipLogs.entries()) {
        const active = timestamps.filter((time) => time > threshold);
        if (active.length === 0) {
          ipLogs.delete(ip);
        } else {
          ipLogs.set(ip, active);
        }
      }
    },
    5 * 60 * 1000,
  );

  cleanup.unref(); // Prevent timer from blocking process exit

  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Filter out timestamps outside the current sliding window
    const timestamps = (ipLogs.get(ip) || []).filter((time) => time > windowStart);

    if (timestamps.length >= max) {
      const oldestHit = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestHit + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return next(new AppError(429, 'RATE_LIMIT_EXCEEDED', message));
    }

    timestamps.push(now);
    ipLogs.set(ip, timestamps);
    next();
  };
}

export const signUpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15-minute sliding window
  max: 10, // Max 10 requests per IP per window
  message: 'Too many registration attempts. Please try again in 15 minutes.',
});

export const signInLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15-minute sliding window
  max: 10, // Max 10 requests per IP per window
  message: 'Too many failed sign-in attempts. Please try again in 15 minutes.',
});

export const otpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15-minute sliding window
  max: 5, // Max 5 requests per IP per window
  message: 'Too many OTP requests from this IP. Please try again in 15 minutes.',
});

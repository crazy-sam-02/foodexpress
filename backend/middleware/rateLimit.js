// Simple in-memory rate limiter middleware (per session/IP)
// Window-based limiter: max N requests per windowMs
// Note: For clustered/deployed environments, replace with a shared store (Redis) or express-rate-limit.

const buckets = new Map(); // key -> { count, resetAt }

export function createRateLimiter({ windowMs = 60_000, max = 20, keyGenerator } = {}) {
  return function rateLimit(req, res, next) {
    try {
      const key = (keyGenerator && keyGenerator(req)) || req.sessionID || req.ip || 'global';
      const now = Date.now();
      const entry = buckets.get(key);

      if (!entry || entry.resetAt <= now) {
        // Start a new window
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }

      if (entry.count < max) {
        entry.count += 1;
        return next();
      }

      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec.toString());
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: retryAfterSec,
      });
    } catch (err) {
      // Fail-open on limiter errors
      return next();
    }
  };
}

export default createRateLimiter;

import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Extracts real client IP address across various proxies (Cloudflare, Render, AWS ALB, Nginx).
 */
export const getClientIp = (req) => {
  // 1. Cloudflare connecting IP
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }
  // 2. Real IP header (Reverse proxy / Nginx)
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  // 3. X-Forwarded-For header (first entry is original client)
  if (req.headers['x-forwarded-for']) {
    const list = String(req.headers['x-forwarded-for']).split(',');
    if (list.length > 0 && list[0].trim()) {
      return list[0].trim();
    }
  }
  // 4. Express req.ip or socket
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

/**
 * 1. General API Rate Limiter
 * - Production: 1,500 requests per 15 minutes per IP (supports rich SPA navigation).
 * - Development: 10,000 requests per 15 mins (avoids throttling developers/testers).
 * - Preflight OPTIONS and health check are exempt.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { xForwardedForHeader: false, default: true },
  skip: (req) => {
    // Exempt CORS preflight
    if (req.method === 'OPTIONS') return true;
    // Exempt health check
    if (req.path === '/health' || req.path === '/api/health') return true;
    // In local dev, skip rate limit for loopback addresses
    if (isDev) {
      const ip = getClientIp(req);
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost') {
        return true;
      }
    }
    return false;
  },
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/**
 * 2. Auth Limiter (Brute-force protection for sensitive POST /login and POST /register)
 * - Only applied to login and register endpoints, NOT wishlist or profile.
 * - Successful attempts do not penalize users (skipSuccessfulRequests: true).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 30, // 30 attempts per 15 mins in production, generous in dev
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: getClientIp,
  validate: { xForwardedForHeader: false, default: true },
  skip: (req) => {
    if (req.method === 'OPTIONS') return true;
    if (isDev) {
      const ip = getClientIp(req);
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost') {
        return true;
      }
    }
    return false;
  },
  message: {
    success: false,
    message: 'Too many login or registration attempts. Please try again after 15 minutes.'
  }
});

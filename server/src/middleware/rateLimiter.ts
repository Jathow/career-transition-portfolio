import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

// Disable rate limiting in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Simple no-op middleware for development
const noOpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next();
};

// Read overrides from environment for easy tuning without code changes
const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const API_WINDOW_MS = toInt(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const API_MAX = toInt(process.env.API_RATE_LIMIT_MAX, 100);

const AUTH_WINDOW_MS = toInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const AUTH_MAX = toInt(process.env.AUTH_RATE_LIMIT_MAX, 100);

// Production rate limiters
const productionApiLimiter = rateLimit({
  windowMs: API_WINDOW_MS,
  max: API_MAX,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString()
      }
    });
  }
});

const productionAuthLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX,
  // Do not count successful auth calls (e.g., profile checks, successful logins)
  skipSuccessfulRequests: true,
  // Use email when available to avoid one IP throttling multiple users on shared networks
  keyGenerator: (req) => {
    try {
      const email = (req.body as any)?.email || (req.query as any)?.email;
      if (typeof email === 'string' && email.trim().length > 0) {
        return `email:${email.trim().toLowerCase()}`;
      }
    } catch {}
    const ua = req.get('User-Agent') || '';
    return `ip:${req.ip}|ua:${ua}`;
  },
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later.',
        timestamp: new Date().toISOString()
      }
    });
  }
});

const productionUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Too many file uploads, please try again later.',
        timestamp: new Date().toISOString()
      }
    });
  }
});

const productionAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many admin requests, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Admin rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'ADMIN_RATE_LIMIT_EXCEEDED',
        message: 'Too many admin requests, please try again later.',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Export the appropriate middleware based on environment
export const apiLimiter = isDevelopment ? noOpMiddleware : productionApiLimiter;
export const authLimiter = isDevelopment ? noOpMiddleware : productionAuthLimiter;
export const uploadLimiter = isDevelopment ? noOpMiddleware : productionUploadLimiter;
export const adminLimiter = isDevelopment ? noOpMiddleware : productionAdminLimiter; 
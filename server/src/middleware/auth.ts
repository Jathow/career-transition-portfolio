import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload extends BaseJwtPayload {
  userId: string;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  logger.debug('Auth Debug', {
    path: req.path,
    method: req.method,
    authHeader: authHeader ? 'present' : 'missing',
    token: token ? `${token.substring(0, 20)}...` : 'null',
    userAgent: req.headers['user-agent']
  });

  if (!token) {
    logger.warn('No token provided', { path: req.path });
    return next(createError('Access token required', 401, 'TOKEN_REQUIRED'));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT secret not configured');
      return next(createError('JWT secret not configured', 500, 'SERVER_ERROR'));
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    logger.info('Token verified successfully', { 
      email: decoded.email, 
      userId: decoded.userId,
      path: req.path 
    });
    (req as any).user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      token: token ? `${token.substring(0, 20)}...` : 'null'
    });
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError('Token has expired', 401, 'TOKEN_EXPIRED'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Invalid token', 401, 'INVALID_TOKEN'));
    }
    next(error);
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First authenticate the token
    await new Promise<void>((resolve, reject) => {
      authenticateToken(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Then check if user has admin role
    const userId = (req as any).user?.userId;
    if (!userId) {
      return next(createError('User not found', 401, 'USER_NOT_FOUND'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true }
    });

    if (!user) {
      return next(createError('User not found', 401, 'USER_NOT_FOUND'));
    }

    if (user.role !== 'ADMIN') {
      logger.warn('Non-admin user attempted to access admin route', { 
        email: user.email, 
        role: user.role 
      });
      return next(createError('Admin access required', 403, 'ADMIN_ACCESS_REQUIRED'));
    }

    logger.info('Admin access granted', { email: user.email });
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    (req as any).user = decoded;
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
  }
  
  next();
};
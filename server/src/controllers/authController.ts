import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { registerSchema, loginSchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { isLockedOut, recordFailure, clearFailures } from '../utils/lockout';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const generateToken = (userId: string, email: string, emailVerified?: boolean, plan?: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const payload = { userId, email, emailVerified: !!emailVerified, plan };
  const options: jwt.SignOptions = { expiresIn: '7d' };
  
  return jwt.sign(payload, jwtSecret, options);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return next(createError(error.details[0].message, 400, 'VALIDATION_ERROR'));
    }

    const { email, password, firstName, lastName, targetJobTitle, jobSearchDeadline, captchaAnswer } = value;

    // Optional CAPTCHA (dev fallback)
    if (process.env.CAPTCHA_ENABLED === 'true') {
      const provider = process.env.CAPTCHA_PROVIDER || 'dev';
      if (provider === 'dev') {
        if (captchaAnswer !== '5') {
          return next(createError('CAPTCHA verification failed', 400, 'CAPTCHA_FAILED'));
        }
      }
      // TODO: Add production providers (Turnstile/hCaptcha) token verification here
    }

    // Disposable email domain block (simple)
    const disposableCsv = process.env.DISPOSABLE_DOMAINS || '';
    if (disposableCsv) {
      const domain = String(email).split('@')[1]?.toLowerCase();
      const blocked = disposableCsv.split(',').map(d => d.trim().toLowerCase());
      if (domain && blocked.includes(domain)) {
        return next(createError('Email domain is not allowed. Please use a different email.', 400, 'EMAIL_DOMAIN_BLOCKED'));
      }
    }

    // Check if user already exists with database error handling
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbError: any) {
      logger.error('Database error during registration check:', dbError);
      
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        return next(createError('Service temporarily unavailable. Please try again later.', 503, 'SERVICE_UNAVAILABLE'));
      }
      
      return next(createError('Registration service error. Please try again.', 500, 'DATABASE_ERROR'));
    }

    if (existingUser) {
      return next(createError('User with this email already exists', 409, 'USER_EXISTS'));
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with database error handling
    let user;
    try {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          targetJobTitle,
          jobSearchDeadline: jobSearchDeadline ? new Date(jobSearchDeadline) : null,
          emailVerified: false,
          verificationToken: token,
          verificationExpires: expires,
          plan: 'FREE'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          targetJobTitle: true,
          jobSearchDeadline: true,
          emailVerified: true,
          plan: true,
          createdAt: true
        }
      });
    } catch (dbError: any) {
      logger.error('Database error during user creation:', dbError);
      
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        return next(createError('Service temporarily unavailable. Please try again later.', 503, 'SERVICE_UNAVAILABLE'));
      }
      
      return next(createError('Registration failed. Please try again.', 500, 'DATABASE_ERROR'));
    }

    // Generate JWT token (unverified)
    const token = generateToken(user.id, user.email, false, (user as any).plan);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    // Provider-ready: log verification link; replace with email provider send
    const appBase = process.env.APP_BASE_URL || (req.protocol + '://' + req.get('host'));
    const verifyUrl = `${appBase}/api/auth/verify-email?token=${(await prisma.user.findUnique({ where: { id: user.id }, select: { verificationToken: true } }))?.verificationToken}`;
    logger.info('Verification link (dev): ' + verifyUrl);

    res.status(201).json({
      success: true,
      data: { user, token, message: 'Verification email sent. Please verify your email to unlock full access.' }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return next(createError(error.details[0].message, 400, 'VALIDATION_ERROR'));
    }

    const { email, password } = value;

    // Check lockout first
    const { locked, remainingMs } = isLockedOut(email, req.ip);
    if (locked) {
      return next(createError(`Too many failed attempts. Try again in ${Math.ceil(remainingMs / 1000)}s.`, 429, 'AUTH_LOCKED'));
    }

    // Find user by email with database error handling
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbError: any) {
      logger.error('Database error during login:', dbError);
      
      // Check for common database issues
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        return next(createError('Service temporarily unavailable. Please try again later.', 503, 'SERVICE_UNAVAILABLE'));
      }
      
      return next(createError('Authentication service error. Please try again.', 500, 'DATABASE_ERROR'));
    }

    if (!user) {
      recordFailure(email, req.ip);
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      recordFailure(email, req.ip);
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Generate JWT token with emailVerified claim
    const token = generateToken(user.id, user.email, (user as any).emailVerified, (user as any).plan);

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    logger.info('User logged in successfully', { userId: user.id, email: user.email });
    // Clear failures on success
    clearFailures(email, req.ip);

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      return next(createError('Verification token is required', 400, 'VERIFICATION_TOKEN_REQUIRED'));
    }
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      return next(createError('Invalid or expired verification token', 400, 'VERIFICATION_INVALID'));
    }
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return next(createError('Verification token has expired', 400, 'VERIFICATION_EXPIRED'));
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });
    res.json({ success: true, data: { message: 'Email verified successfully.' } });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        targetJobTitle: true,
        jobSearchDeadline: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return next(createError('User not found', 404, 'USER_NOT_FOUND'));
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { firstName, lastName, targetJobTitle, jobSearchDeadline } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(targetJobTitle && { targetJobTitle }),
        ...(jobSearchDeadline && { jobSearchDeadline: new Date(jobSearchDeadline) })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        targetJobTitle: true,
        jobSearchDeadline: true,
        updatedAt: true
      }
    });

    logger.info('User profile updated', { userId });

    res.json({
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};
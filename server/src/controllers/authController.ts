import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { registerSchema, loginSchema } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const payload = { userId, email };
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

    const { email, password, firstName, lastName, targetJobTitle, jobSearchDeadline } = value;

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
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          targetJobTitle,
          jobSearchDeadline: jobSearchDeadline ? new Date(jobSearchDeadline) : null
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          targetJobTitle: true,
          jobSearchDeadline: true,
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

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
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
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

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
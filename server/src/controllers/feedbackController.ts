import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId || null;
    const { message, path, userAgent } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return next(createError('Feedback message is required', 400, 'FEEDBACK_REQUIRED'));
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        message: message.trim(),
        path: path || req.path,
        userAgent: userAgent || req.headers['user-agent'] || null,
      },
    });

    res.status(201).json({ success: true, data: { id: feedback.id } });
  } catch (error) {
    next(error);
  }
};



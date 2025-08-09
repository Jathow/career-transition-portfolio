import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULTS = {
  dailyApplications: Number(process.env.LIMITS_DAILY_APPLICATIONS || 50),
  dailyInterviews: Number(process.env.LIMITS_DAILY_INTERVIEWS || 20),
};

export async function enforceDailyApplicationLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.userId;
    const plan = (req as any).user?.plan || 'FREE';
    if (!userId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });

    const limit = plan === 'PRO' ? DEFAULTS.dailyApplications * 10 : DEFAULTS.dailyApplications;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const count = await prisma.jobApplication.count({
      where: { userId, createdAt: { gte: startOfDay } },
    });

    if (count >= limit) {
      return res.status(402).json({
        success: false,
        error: {
          code: 'PLAN_QUOTA_EXCEEDED',
          message: 'Daily application limit reached for your plan. Upgrade to increase limits.',
          limit,
          used: count,
        },
      });
    }

    next();
  } catch (e) {
    next(e);
  }
}



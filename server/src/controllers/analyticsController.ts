import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ingestEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.ANALYTICS_ENABLED !== 'true') {
      return res.status(204).end();
    }

    const { eventName, path } = req.body || {};
    if (!eventName || typeof eventName !== 'string') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_EVENT', message: 'eventName is required' } });
    }
    const safePath = typeof path === 'string' ? path.slice(0, 200) : 'unknown';
    const day = new Date();
    day.setHours(0, 0, 0, 0);

    await prisma.analyticsEvent.upsert({
      where: {
        day_path_eventName: {
          day,
          path: safePath,
          eventName,
        },
      },
      update: {
        count: { increment: 1 },
        lastSeenAt: new Date(),
      },
      create: {
        day,
        path: safePath,
        eventName,
        count: 1,
        lastSeenAt: new Date(),
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};



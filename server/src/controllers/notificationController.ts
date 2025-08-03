import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { createError } from '../utils/errorHandler';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class NotificationController {
  /**
   * Get user's notifications
   */
  static async getUserNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { unreadOnly, limit, offset } = req.query;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const notifications = await NotificationService.getUserNotifications(userId, {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification count
   */
  static async getNotificationCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { unreadOnly } = req.query;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const count = await NotificationService.getNotificationCount(userId, unreadOnly === 'true');

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { notificationId } = req.params;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      await NotificationService.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      await NotificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { notificationId } = req.params;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      await NotificationService.deleteNotification(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const stats = await NotificationService.getNotificationStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process deadline notifications for user
   */
  static async processDeadlineNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      await NotificationService.processDeadlineNotifications(userId);

      res.json({
        success: true,
        message: 'Deadline notifications processed'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create milestone notification
   */
  static async createMilestoneNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { projectTitle, milestone } = req.body;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      if (!projectTitle || !milestone) {
        return next(createError('Project title and milestone are required', 400, 'VALIDATION_ERROR'));
      }

      await NotificationService.createMilestoneNotification(userId, projectTitle, milestone);

      res.json({
        success: true,
        message: 'Milestone notification created'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create project completion notification
   */
  static async createProjectCompletionNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { projectTitle } = req.body;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      if (!projectTitle) {
        return next(createError('Project title is required', 400, 'VALIDATION_ERROR'));
      }

      await NotificationService.createProjectCompletionNotification(userId, projectTitle);

      res.json({
        success: true,
        message: 'Project completion notification created'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create progress notification
   */
  static async createProgressNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { projectTitle, progress } = req.body;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      if (!projectTitle || progress === undefined) {
        return next(createError('Project title and progress are required', 400, 'VALIDATION_ERROR'));
      }

      await NotificationService.createProgressNotification(userId, projectTitle, progress);

      res.json({
        success: true,
        message: 'Progress notification created'
      });
    } catch (error) {
      next(error);
    }
  }
} 
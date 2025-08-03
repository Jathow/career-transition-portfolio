import { Request, Response, NextFunction } from 'express';
import { TimeTrackingService } from '../services/timeTrackingService';
import { createError } from '../utils/errorHandler';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class TimeTrackingController {
  /**
   * Get progress for a specific project
   */
  static async getProjectProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const progress = await TimeTrackingService.calculateProjectProgress(projectId);
      
      if (!progress) {
        return next(createError('Project not found', 404, 'PROJECT_NOT_FOUND'));
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get progress for all user's projects
   */
  static async getAllProjectsProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const progress = await TimeTrackingService.getAllProjectsProgress(userId);

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get deadline notifications
   */
  static async getDeadlineNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const notifications = await TimeTrackingService.getDeadlineNotifications(userId);

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project timeline data for visualization
   */
  static async getProjectTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const timeline = await TimeTrackingService.getProjectTimeline(userId);

      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's overall progress statistics
   */
  static async getUserProgressStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      const stats = await TimeTrackingService.getUserProgressStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update project statuses based on deadlines (admin/automated endpoint)
   */
  static async updateProjectStatuses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(createError('User not authenticated', 401, 'UNAUTHORIZED'));
      }

      await TimeTrackingService.updateProjectStatusByDeadline();

      res.json({
        success: true,
        message: 'Project statuses updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
} 
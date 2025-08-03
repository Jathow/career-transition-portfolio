import { Request, Response } from 'express';
import { MotivationService } from '../services/motivationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MotivationController {
  /**
   * Log daily activity
   */
  static async logDailyActivity(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const logData = {
        userId,
        ...req.body
      };

      const result = await MotivationService.logDailyActivity(logData);

      res.json({
        success: true,
        data: result,
        message: 'Daily activity logged successfully'
      });
    } catch (error) {
      console.error('Error logging daily activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to log daily activity'
      });
    }
  }

  /**
   * Get daily logs for a date range
   */
  static async getDailyLogs(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
      }

      const logs = await MotivationService.getDailyLogs(
        userId,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting daily logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get daily logs'
      });
    }
  }

  /**
   * Create a new goal
   */
  static async createGoal(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const goalData = req.body;

      const result = await MotivationService.createGoal(userId, goalData);

      res.json({
        success: true,
        data: result,
        message: 'Goal created successfully'
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create goal'
      });
    }
  }

  /**
   * Get user's active goals
   */
  static async getActiveGoals(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const goals = await MotivationService.getActiveGoals(userId);

      res.json({
        success: true,
        data: goals
      });
    } catch (error) {
      console.error('Error getting active goals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get active goals'
      });
    }
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(req: Request, res: Response) {
    try {
      const { goalId } = req.params;
      const { currentValue } = req.body;

      if (typeof currentValue !== 'number' || currentValue < 0) {
        return res.status(400).json({
          success: false,
          error: 'Current value must be a non-negative number'
        });
      }

      const result = await MotivationService.updateGoalProgress(goalId, currentValue);

      res.json({
        success: true,
        data: result,
        message: 'Goal progress updated successfully'
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update goal progress'
      });
    }
  }

  /**
   * Get user's achievements
   */
  static async getAchievements(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const achievements = await MotivationService.getAchievements(userId);

      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      console.error('Error getting achievements:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get achievements'
      });
    }
  }

  /**
   * Get unread motivational feedback
   */
  static async getUnreadMotivationalFeedback(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const feedback = await MotivationService.getUnreadMotivationalFeedback(userId);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error getting motivational feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get motivational feedback'
      });
    }
  }

  /**
   * Mark motivational feedback as read
   */
  static async markFeedbackAsRead(req: Request, res: Response) {
    try {
      const { feedbackId } = req.params;
      const result = await MotivationService.markFeedbackAsRead(feedbackId);

      res.json({
        success: true,
        data: result,
        message: 'Feedback marked as read'
      });
    } catch (error) {
      console.error('Error marking feedback as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark feedback as read'
      });
    }
  }

  /**
   * Get comprehensive progress statistics
   */
  static async getProgressStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const stats = await MotivationService.getProgressStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting progress stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get progress statistics'
      });
    }
  }

  /**
   * Generate strategic guidance
   */
  static async generateStrategicGuidance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const guidance = await MotivationService.generateStrategicGuidance(userId);

      res.json({
        success: true,
        data: guidance
      });
    } catch (error) {
      console.error('Error generating strategic guidance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate strategic guidance'
      });
    }
  }

  /**
   * Get user's overall motivation dashboard data
   */
  static async getMotivationDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      // Get all relevant data for the dashboard
      const [stats, activeGoals, achievements, unreadFeedback, guidance] = await Promise.all([
        MotivationService.getProgressStats(userId),
        MotivationService.getActiveGoals(userId),
        MotivationService.getAchievements(userId),
        MotivationService.getUnreadMotivationalFeedback(userId),
        MotivationService.generateStrategicGuidance(userId)
      ]);

      // Get recent daily logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentLogs = await MotivationService.getDailyLogs(
        userId,
        sevenDaysAgo.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      res.json({
        success: true,
        data: {
          stats,
          activeGoals,
          achievements,
          unreadFeedback,
          guidance,
          recentLogs
        }
      });
    } catch (error) {
      console.error('Error getting motivation dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get motivation dashboard'
      });
    }
  }

  /**
   * Create a custom achievement (for testing or manual creation)
   */
  static async createCustomAchievement(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const achievementData = req.body;

      const result = await MotivationService.createAchievement(userId, achievementData);

      res.json({
        success: true,
        data: result,
        message: 'Achievement created successfully'
      });
    } catch (error) {
      console.error('Error creating achievement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create achievement'
      });
    }
  }

  /**
   * Get goal by ID
   */
  static async getGoal(req: Request, res: Response) {
    try {
      const { goalId } = req.params;
      const userId = (req as any).user.userId;

      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId
        }
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          error: 'Goal not found'
        });
      }

      res.json({
        success: true,
        data: goal
      });
    } catch (error) {
      console.error('Error getting goal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get goal'
      });
    }
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(req: Request, res: Response) {
    try {
      const { goalId } = req.params;
      const userId = (req as any).user.userId;

      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId
        }
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          error: 'Goal not found'
        });
      }

      await prisma.goal.delete({
        where: { id: goalId }
      });

      res.json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete goal'
      });
    }
  }
} 
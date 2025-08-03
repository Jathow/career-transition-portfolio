import { Request, Response } from 'express';
import { RevenueTrackingService } from '../services/revenueTrackingService';
import { logger } from '../utils/logger';

const revenueTrackingService = new RevenueTrackingService();

export class RevenueTrackingController {
  // Revenue Metrics CRUD operations
  async createRevenueMetric(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;
      const data = req.body;

      const revenueMetric = await revenueTrackingService.createRevenueMetric(
        userId,
        projectId,
        data
      );

      res.status(201).json({
        success: true,
        data: revenueMetric,
      });
    } catch (error) {
      logger.error('Error creating revenue metric:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create revenue metric',
        },
      });
    }
  }

  async getProjectRevenueMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;

      const revenueMetrics = await revenueTrackingService.getProjectRevenueMetrics(
        userId,
        projectId
      );

      res.json({
        success: true,
        data: revenueMetrics,
      });
    } catch (error) {
      logger.error('Error fetching project revenue metrics:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch revenue metrics',
        },
      });
    }
  }

  async updateRevenueMetric(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { metricId } = req.params;
      const data = req.body;

      const revenueMetric = await revenueTrackingService.updateRevenueMetric(
        userId,
        metricId,
        data
      );

      res.json({
        success: true,
        data: revenueMetric,
      });
    } catch (error) {
      logger.error('Error updating revenue metric:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update revenue metric',
        },
      });
    }
  }

  async deleteRevenueMetric(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { metricId } = req.params;

      await revenueTrackingService.deleteRevenueMetric(userId, metricId);

      res.json({
        success: true,
        message: 'Revenue metric deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting revenue metric:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete revenue metric',
        },
      });
    }
  }

  // Project Analytics operations
  async createProjectAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;
      const data = req.body;

      const analytics = await revenueTrackingService.createProjectAnalytics(
        userId,
        projectId,
        data
      );

      res.status(201).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('Error creating project analytics:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create project analytics',
        },
      });
    }
  }

  async getProjectAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;
      const { analyticsType } = req.query;

      const analytics = await revenueTrackingService.getProjectAnalytics(
        userId,
        projectId,
        analyticsType as any
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('Error fetching project analytics:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch project analytics',
        },
      });
    }
  }

  // Monetization Strategies CRUD operations
  async createMonetizationStrategy(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;
      const data = req.body;

      const strategy = await revenueTrackingService.createMonetizationStrategy(
        userId,
        projectId,
        data
      );

      res.status(201).json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      logger.error('Error creating monetization strategy:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create monetization strategy',
        },
      });
    }
  }

  async getProjectMonetizationStrategies(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;

      const strategies = await revenueTrackingService.getProjectMonetizationStrategies(
        userId,
        projectId
      );

      res.json({
        success: true,
        data: strategies,
      });
    } catch (error) {
      logger.error('Error fetching project monetization strategies:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch monetization strategies',
        },
      });
    }
  }

  async updateMonetizationStrategy(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { strategyId } = req.params;
      const data = req.body;

      const strategy = await revenueTrackingService.updateMonetizationStrategy(
        userId,
        strategyId,
        data
      );

      res.json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      logger.error('Error updating monetization strategy:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update monetization strategy',
        },
      });
    }
  }

  async deleteMonetizationStrategy(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { strategyId } = req.params;

      await revenueTrackingService.deleteMonetizationStrategy(userId, strategyId);

      res.json({
        success: true,
        message: 'Monetization strategy deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting monetization strategy:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete monetization strategy',
        },
      });
    }
  }

  // Analytics and reporting endpoints
  async getRevenueTrackingSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const summary = await revenueTrackingService.getRevenueTrackingSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error fetching revenue tracking summary:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch revenue tracking summary',
        },
      });
    }
  }

  async getProjectRevenueAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;

      const analysis = await revenueTrackingService.getProjectRevenueAnalysis(userId, projectId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error fetching project revenue analysis:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch project revenue analysis',
        },
      });
    }
  }

  async getUserRevenueMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const revenueMetrics = await revenueTrackingService.getUserRevenueMetrics(userId);

      res.json({
        success: true,
        data: revenueMetrics,
      });
    } catch (error) {
      logger.error('Error fetching user revenue metrics:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch user revenue metrics',
        },
      });
    }
  }

  async getUserMonetizationStrategies(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const strategies = await revenueTrackingService.getUserMonetizationStrategies(userId);

      res.json({
        success: true,
        data: strategies,
      });
    } catch (error) {
      logger.error('Error fetching user monetization strategies:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch user monetization strategies',
        },
      });
    }
  }
} 
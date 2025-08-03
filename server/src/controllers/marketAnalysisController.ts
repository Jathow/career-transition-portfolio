import { Request, Response } from 'express';
import { MarketAnalysisService } from '../services/marketAnalysisService';
import { logger } from '../utils/logger';

const marketAnalysisService = new MarketAnalysisService();

export class MarketAnalysisController {
  // Market Research CRUD operations
  async createMarketResearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;
      const data = req.body;

      const marketResearch = await marketAnalysisService.createMarketResearch(
        userId,
        projectId,
        data
      );

      res.status(201).json({
        success: true,
        data: marketResearch,
      });
    } catch (error) {
      logger.error('Error creating market research:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create market research',
        },
      });
    }
  }

  async getProjectMarketResearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;

      const marketResearch = await marketAnalysisService.getProjectMarketResearch(
        userId,
        projectId
      );

      res.json({
        success: true,
        data: marketResearch,
      });
    } catch (error) {
      logger.error('Error fetching project market research:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch market research',
        },
      });
    }
  }

  async getMarketResearchById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { researchId } = req.params;

      const marketResearch = await marketAnalysisService.getMarketResearchById(
        userId,
        researchId
      );

      if (!marketResearch) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Market research not found',
          },
        });
      }

      res.json({
        success: true,
        data: marketResearch,
      });
    } catch (error) {
      logger.error('Error fetching market research by ID:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch market research',
        },
      });
    }
  }

  async updateMarketResearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { researchId } = req.params;
      const data = req.body;

      const marketResearch = await marketAnalysisService.updateMarketResearch(
        userId,
        researchId,
        data
      );

      res.json({
        success: true,
        data: marketResearch,
      });
    } catch (error) {
      logger.error('Error updating market research:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update market research',
        },
      });
    }
  }

  async deleteMarketResearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { researchId } = req.params;

      await marketAnalysisService.deleteMarketResearch(userId, researchId);

      res.json({
        success: true,
        message: 'Market research deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting market research:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete market research',
        },
      });
    }
  }

  // Analytics and reporting endpoints
  async getUserMarketResearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const marketResearch = await marketAnalysisService.getUserMarketResearch(userId);

      res.json({
        success: true,
        data: marketResearch,
      });
    } catch (error) {
      logger.error('Error fetching user market research:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch user market research',
        },
      });
    }
  }

  async getMarketAnalysisSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const summary = await marketAnalysisService.getMarketAnalysisSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error fetching market analysis summary:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch market analysis summary',
        },
      });
    }
  }

  async getCompetitionAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;

      const analysis = await marketAnalysisService.getCompetitionAnalysis(userId, projectId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error fetching competition analysis:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch competition analysis',
        },
      });
    }
  }

  async getOpportunityAssessment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { projectId } = req.params;

      const assessment = await marketAnalysisService.getOpportunityAssessment(userId, projectId);

      res.json({
        success: true,
        data: assessment,
      });
    } catch (error) {
      logger.error('Error fetching opportunity assessment:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch opportunity assessment',
        },
      });
    }
  }
} 
import { Request, Response } from 'express';
import portfolioService from '../services/portfolioService';
import { logger } from '../utils/logger';

export class PortfolioController {
  /**
   * Create or update user portfolio
   */
  async createOrUpdatePortfolio(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const portfolioData = req.body;

      const portfolio = await portfolioService.createOrUpdatePortfolio(userId, portfolioData);

      res.status(200).json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error('Error in createOrUpdatePortfolio:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create or update portfolio',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Get user's portfolio
   */
  async getUserPortfolio(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      let portfolio = await portfolioService.getPortfolioByUserId(userId);

      if (!portfolio) {
        // Create a default portfolio if one doesn't exist
        portfolio = await portfolioService.createOrUpdatePortfolio(userId, {
          title: 'My Portfolio',
          subtitle: 'Professional Portfolio',
          description: 'Welcome to my professional portfolio showcasing my projects and skills.',
          theme: 'default',
          isPublic: true,
          analyticsEnabled: true
        });
      }

      res.status(200).json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error('Error in getUserPortfolio:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch portfolio',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Get public portfolio (no authentication required)
   */
  async getPublicPortfolio(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const portfolio = await portfolioService.getPublicPortfolio(userId);

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Portfolio not found or not public'
          }
        });
      }

      // Track analytics if enabled
      if (portfolio.analyticsEnabled) {
        const analyticsData = {
          visitorIp: req.ip,
          userAgent: req.get('User-Agent'),
          referrer: req.get('Referrer'),
          page: 'home',
          sessionId: (req as any).sessionID || null
        };

        portfolioService.trackPortfolioView(portfolio.id, analyticsData);
      }

      res.status(200).json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error('Error in getPublicPortfolio:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch public portfolio',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Get public portfolio content (no authentication required)
   */
  async getPublicPortfolioContent(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const content = await portfolioService.generatePublicPortfolioContent(userId, {
        includeCompletedProjects: true,
        includeResume: true,
        includeAnalytics: false,
      });

      if (!content) {
        return res.status(404).json({
          success: false,
          error: { message: 'Portfolio not found or not public' }
        });
      }

      res.status(200).json({ success: true, data: content });
    } catch (error) {
      logger.error('Error in getPublicPortfolioContent:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch public portfolio content',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Generate portfolio content
   */
  async generatePortfolioContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const options = req.body;

      const content = await portfolioService.generatePortfolioContent(userId, options);

      res.status(200).json({
        success: true,
        data: content
      });
    } catch (error) {
      logger.error('Error in generatePortfolioContent:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to generate portfolio content',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Add asset to portfolio
   */
  async addPortfolioAsset(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { portfolioId, ...assetData } = req.body;

      // Verify portfolio belongs to user
      const portfolio = await portfolioService.getPortfolioByUserId(userId);
      if (!portfolio || portfolio.id !== portfolioId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied to portfolio'
          }
        });
      }

      const asset = await portfolioService.addPortfolioAsset(portfolioId, assetData);

      res.status(201).json({
        success: true,
        data: asset
      });
    } catch (error) {
      logger.error('Error in addPortfolioAsset:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to add portfolio asset',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Get portfolio assets
   */
  async getPortfolioAssets(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { portfolioId } = req.params;

      // Verify portfolio belongs to user
      const portfolio = await portfolioService.getPortfolioByUserId(userId);
      if (!portfolio || portfolio.id !== portfolioId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied to portfolio'
          }
        });
      }

      const assets = await portfolioService.getPortfolioAssets(portfolioId);

      res.status(200).json({
        success: true,
        data: assets
      });
    } catch (error) {
      logger.error('Error in getPortfolioAssets:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch portfolio assets',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Delete portfolio asset
   */
  async deletePortfolioAsset(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { assetId } = req.params;

      // Verify asset belongs to user's portfolio
      const portfolio = await portfolioService.getPortfolioByUserId(userId);
      if (!portfolio) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied to portfolio'
          }
        });
      }

      await portfolioService.deletePortfolioAsset(assetId);

      res.status(200).json({
        success: true,
        message: 'Asset deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deletePortfolioAsset:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to delete portfolio asset',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { days } = req.query;

      const portfolio = await portfolioService.getPortfolioByUserId(userId);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Portfolio not found'
          }
        });
      }

      const analytics = await portfolioService.getPortfolioAnalytics(
        portfolio.id,
        days ? parseInt(days as string) : 30
      );

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error in getPortfolioAnalytics:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch portfolio analytics',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Update portfolio SEO settings
   */
  async updatePortfolioSEO(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const seoData = req.body;

      const portfolio = await portfolioService.updatePortfolioSEO(userId, seoData);

      res.status(200).json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error('Error in updatePortfolioSEO:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update portfolio SEO',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Toggle portfolio visibility
   */
  async togglePortfolioVisibility(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const portfolio = await portfolioService.togglePortfolioVisibility(userId);

      res.status(200).json({
        success: true,
        data: portfolio,
        message: `Portfolio is now ${portfolio.isPublic ? 'public' : 'private'}`
      });
    } catch (error) {
      logger.error('Error in togglePortfolioVisibility:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to toggle portfolio visibility',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
}

export default new PortfolioController(); 
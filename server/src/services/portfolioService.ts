import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface PortfolioData {
  id: string;
  userId: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  theme: string;
  customDomain: string | null;
  isPublic: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  analyticsEnabled: boolean;
  lastGenerated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioAssetData {
  id: string;
  portfolioId: string;
  type: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioAnalyticsData {
  id: string;
  portfolioId: string;
  visitorIp?: string;
  userAgent?: string;
  referrer?: string;
  page: string;
  timestamp: Date;
  sessionId?: string;
}

export interface PortfolioGenerationOptions {
  includeCompletedProjects?: boolean;
  includeResume?: boolean;
  includeAnalytics?: boolean;
  theme?: string;
}

export class PortfolioService {
  /**
   * Create or update a user's portfolio
   */
  async createOrUpdatePortfolio(userId: string, portfolioData: Partial<PortfolioData>): Promise<PortfolioData> {
    try {
      const existingPortfolio = await prisma.portfolio.findUnique({
        where: { userId }
      });

      if (existingPortfolio) {
        const updatedPortfolio = await prisma.portfolio.update({
          where: { userId },
          data: {
            ...portfolioData,
            lastGenerated: new Date()
          }
        });
        logger.info(`Portfolio updated for user ${userId}`);
        return updatedPortfolio;
      } else {
        const newPortfolio = await prisma.portfolio.create({
          data: {
            userId,
            title: portfolioData.title || 'My Portfolio',
            subtitle: portfolioData.subtitle,
            description: portfolioData.description,
            theme: portfolioData.theme || 'default',
            customDomain: portfolioData.customDomain,
            isPublic: portfolioData.isPublic ?? true,
            seoTitle: portfolioData.seoTitle,
            seoDescription: portfolioData.seoDescription,
            seoKeywords: portfolioData.seoKeywords,
            analyticsEnabled: portfolioData.analyticsEnabled ?? true
          }
        });
        logger.info(`Portfolio created for user ${userId}`);
        return newPortfolio;
      }
    } catch (error) {
      logger.error('Error creating/updating portfolio:', error);
      throw new Error('Failed to create or update portfolio');
    }
  }

  /**
   * Get portfolio by user ID
   */
  async getPortfolioByUserId(userId: string): Promise<PortfolioData | null> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: {
          assets: {
            orderBy: { order: 'asc' }
          }
        }
      });
      return portfolio;
    } catch (error) {
      logger.error('Error fetching portfolio:', error);
      throw new Error('Failed to fetch portfolio');
    }
  }

  /**
   * Get public portfolio by user ID (for public viewing)
   */
  async getPublicPortfolio(userId: string): Promise<PortfolioData | null> {
    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { 
          userId,
          isPublic: true
        },
        include: {
          assets: {
            where: { portfolio: { isPublic: true } },
            orderBy: { order: 'asc' }
          }
        }
      });
      return portfolio;
    } catch (error) {
      logger.error('Error fetching public portfolio:', error);
      throw new Error('Failed to fetch public portfolio');
    }
  }

  /**
   * Generate portfolio content from user data
   */
  async generatePortfolioContent(userId: string, options: PortfolioGenerationOptions = {}): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          projects: {
            where: options.includeCompletedProjects ? { status: 'COMPLETED' } : {},
            orderBy: { actualEndDate: 'desc' }
          },
          resumes: {
            where: { isDefault: true }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      let portfolio = await this.getPortfolioByUserId(userId);
      if (!portfolio) {
        // Create a default portfolio if one doesn't exist
        portfolio = await this.createOrUpdatePortfolio(userId, {
          title: `${user.firstName} ${user.lastName}'s Portfolio`,
          subtitle: user.targetJobTitle || 'Professional Portfolio',
          description: `Welcome to my professional portfolio showcasing my projects and skills.`,
          theme: 'default',
          isPublic: true,
          analyticsEnabled: true
        });
      }

      // Generate portfolio content
      const content = {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          targetJobTitle: user.targetJobTitle,
          email: user.email
        },
        portfolio: {
          title: portfolio.title,
          subtitle: portfolio.subtitle,
          description: portfolio.description,
          theme: portfolio.theme
        },
        projects: user.projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          techStack: project.techStack,
          repositoryUrl: project.repositoryUrl,
          liveUrl: project.liveUrl,
          startDate: project.startDate,
          actualEndDate: project.actualEndDate,
          revenueTracking: project.revenueTracking,
          marketResearch: project.marketResearch
        })),
        resume: options.includeResume && user.resumes.length > 0 ? {
          content: JSON.parse(user.resumes[0].content)
        } : null,
        seo: {
          title: portfolio.seoTitle,
          description: portfolio.seoDescription,
          keywords: portfolio.seoKeywords
        },
        analytics: options.includeAnalytics && portfolio.analyticsEnabled
      };

      // Update last generated timestamp
      await prisma.portfolio.update({
        where: { userId },
        data: { lastGenerated: new Date() }
      });

      logger.info(`Portfolio content generated for user ${userId}`);
      return content;
    } catch (error) {
      logger.error('Error generating portfolio content:', error);
      throw new Error('Failed to generate portfolio content');
    }
  }

  /**
   * Add asset to portfolio
   */
  async addPortfolioAsset(portfolioId: string, assetData: Partial<PortfolioAssetData>): Promise<PortfolioAssetData> {
    try {
      const asset = await prisma.portfolioAsset.create({
        data: {
          portfolioId,
          type: assetData.type!,
          filename: assetData.filename!,
          originalName: assetData.originalName!,
          mimeType: assetData.mimeType!,
          size: assetData.size!,
          url: assetData.url!,
          altText: assetData.altText,
          order: assetData.order || 0
        }
      });
      logger.info(`Asset added to portfolio ${portfolioId}`);
      return asset;
    } catch (error) {
      logger.error('Error adding portfolio asset:', error);
      throw new Error('Failed to add portfolio asset');
    }
  }

  /**
   * Get portfolio assets
   */
  async getPortfolioAssets(portfolioId: string): Promise<PortfolioAssetData[]> {
    try {
      const assets = await prisma.portfolioAsset.findMany({
        where: { portfolioId },
        orderBy: { order: 'asc' }
      });
      return assets;
    } catch (error) {
      logger.error('Error fetching portfolio assets:', error);
      throw new Error('Failed to fetch portfolio assets');
    }
  }

  /**
   * Delete portfolio asset
   */
  async deletePortfolioAsset(assetId: string): Promise<void> {
    try {
      await prisma.portfolioAsset.delete({
        where: { id: assetId }
      });
      logger.info(`Asset ${assetId} deleted`);
    } catch (error) {
      logger.error('Error deleting portfolio asset:', error);
      throw new Error('Failed to delete portfolio asset');
    }
  }

  /**
   * Track portfolio analytics
   */
  async trackPortfolioView(portfolioId: string, analyticsData: Partial<PortfolioAnalyticsData>): Promise<void> {
    try {
      await prisma.portfolioAnalytics.create({
        data: {
          portfolioId,
          visitorIp: analyticsData.visitorIp,
          userAgent: analyticsData.userAgent,
          referrer: analyticsData.referrer,
          page: analyticsData.page || 'home',
          sessionId: analyticsData.sessionId
        }
      });
    } catch (error) {
      logger.error('Error tracking portfolio analytics:', error);
      // Don't throw error for analytics tracking failures
    }
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioAnalytics(portfolioId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await prisma.portfolioAnalytics.findMany({
        where: {
          portfolioId,
          timestamp: {
            gte: startDate
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      // Process analytics data
      const totalViews = analytics.length;
      const uniqueVisitors = new Set(analytics.map(a => a.visitorIp)).size;
      const pageViews = analytics.reduce((acc, a) => {
        acc[a.page] = (acc[a.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const referrers = analytics.reduce((acc, a) => {
        if (a.referrer) {
          acc[a.referrer] = (acc[a.referrer] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalViews,
        uniqueVisitors,
        pageViews,
        referrers,
        recentViews: analytics.slice(0, 10)
      };
    } catch (error) {
      logger.error('Error fetching portfolio analytics:', error);
      throw new Error('Failed to fetch portfolio analytics');
    }
  }

  /**
   * Update portfolio SEO settings
   */
  async updatePortfolioSEO(userId: string, seoData: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }): Promise<PortfolioData> {
    try {
      let portfolio = await prisma.portfolio.findUnique({
        where: { userId }
      });

      if (!portfolio) {
        // Create a default portfolio if one doesn't exist
        portfolio = await this.createOrUpdatePortfolio(userId, {
          title: 'My Portfolio',
          subtitle: 'Professional Portfolio',
          description: 'Welcome to my professional portfolio showcasing my projects and skills.',
          theme: 'default',
          isPublic: true,
          analyticsEnabled: true
        });
      }

      const updatedPortfolio = await prisma.portfolio.update({
        where: { userId },
        data: seoData
      });
      logger.info(`Portfolio SEO updated for user ${userId}`);
      return updatedPortfolio;
    } catch (error) {
      logger.error('Error updating portfolio SEO:', error);
      throw new Error('Failed to update portfolio SEO');
    }
  }

  /**
   * Toggle portfolio public/private status
   */
  async togglePortfolioVisibility(userId: string): Promise<PortfolioData> {
    try {
      let portfolio = await prisma.portfolio.findUnique({
        where: { userId }
      });

      if (!portfolio) {
        // Create a default portfolio if one doesn't exist
        portfolio = await this.createOrUpdatePortfolio(userId, {
          title: 'My Portfolio',
          subtitle: 'Professional Portfolio',
          description: 'Welcome to my professional portfolio showcasing my projects and skills.',
          theme: 'default',
          isPublic: true,
          analyticsEnabled: true
        });
      }

      const updatedPortfolio = await prisma.portfolio.update({
        where: { userId },
        data: { isPublic: !portfolio!.isPublic }
      });

      logger.info(`Portfolio visibility toggled for user ${userId}: ${updatedPortfolio.isPublic ? 'public' : 'private'}`);
      return updatedPortfolio;
    } catch (error) {
      logger.error('Error toggling portfolio visibility:', error);
      throw new Error('Failed to toggle portfolio visibility');
    }
  }
}

export default new PortfolioService(); 
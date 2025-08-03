import { PrismaClient, RevenueMetric, ProjectAnalytics, MonetizationStrategy, Project } from '@prisma/client';
import { 
  CreateRevenueMetricData, 
  UpdateRevenueMetricData, 
  CreateProjectAnalyticsData,
  CreateMonetizationStrategyData,
  UpdateMonetizationStrategyData,
  RevenueMetricWithProject,
  ProjectAnalyticsWithProject,
  MonetizationStrategyWithProject,
  RevenueTrackingSummary,
  MetricType,
  AnalyticsType,
  StrategyType
} from '../types/marketAnalysis';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class RevenueTrackingService {
  // Revenue Metrics Management
  async createRevenueMetric(
    userId: string, 
    projectId: string, 
    data: CreateRevenueMetricData
  ): Promise<RevenueMetric> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.revenueMetric.create({
      data: {
        projectId,
        metricType: data.metricType,
        metricName: data.metricName,
        value: data.value,
        unit: data.unit,
        period: data.period,
        date: data.date,
        notes: data.notes,
      },
    });
  }

  async getProjectRevenueMetrics(
    userId: string, 
    projectId: string
  ): Promise<RevenueMetric[]> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.revenueMetric.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    });
  }

  async updateRevenueMetric(
    userId: string, 
    metricId: string, 
    data: UpdateRevenueMetricData
  ): Promise<RevenueMetric> {
    // Verify ownership
    const existingMetric = await prisma.revenueMetric.findFirst({
      where: { 
        id: metricId,
        project: { userId }
      },
    });

    if (!existingMetric) {
      throw new Error('Revenue metric not found or access denied');
    }

    return await prisma.revenueMetric.update({
      where: { id: metricId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteRevenueMetric(
    userId: string, 
    metricId: string
  ): Promise<void> {
    // Verify ownership
    const existingMetric = await prisma.revenueMetric.findFirst({
      where: { 
        id: metricId,
        project: { userId }
      },
    });

    if (!existingMetric) {
      throw new Error('Revenue metric not found or access denied');
    }

    await prisma.revenueMetric.delete({
      where: { id: metricId },
    });
  }

  // Project Analytics Management
  async createProjectAnalytics(
    userId: string, 
    projectId: string, 
    data: CreateProjectAnalyticsData
  ): Promise<ProjectAnalytics> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.projectAnalytics.create({
      data: {
        projectId,
        analyticsType: data.analyticsType,
        metricName: data.metricName,
        value: data.value,
        date: data.date,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }

  async getProjectAnalytics(
    userId: string, 
    projectId: string,
    analyticsType?: AnalyticsType
  ): Promise<ProjectAnalytics[]> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const whereClause: any = { projectId };
    if (analyticsType) {
      whereClause.analyticsType = analyticsType;
    }

    return await prisma.projectAnalytics.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  // Monetization Strategies Management
  async createMonetizationStrategy(
    userId: string, 
    projectId: string, 
    data: CreateMonetizationStrategyData
  ): Promise<MonetizationStrategy> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.monetizationStrategy.create({
      data: {
        projectId,
        strategyType: data.strategyType,
        title: data.title,
        description: data.description,
        targetAudience: data.targetAudience,
        pricingModel: data.pricingModel,
        revenueProjection: data.revenueProjection,
        implementationPlan: data.implementationPlan,
        status: data.status || 'PLANNING',
        priority: data.priority || 'MEDIUM',
      },
    });
  }

  async getProjectMonetizationStrategies(
    userId: string, 
    projectId: string
  ): Promise<MonetizationStrategy[]> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.monetizationStrategy.findMany({
      where: { projectId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });
  }

  async updateMonetizationStrategy(
    userId: string, 
    strategyId: string, 
    data: UpdateMonetizationStrategyData
  ): Promise<MonetizationStrategy> {
    // Verify ownership
    const existingStrategy = await prisma.monetizationStrategy.findFirst({
      where: { 
        id: strategyId,
        project: { userId }
      },
    });

    if (!existingStrategy) {
      throw new Error('Monetization strategy not found or access denied');
    }

    return await prisma.monetizationStrategy.update({
      where: { id: strategyId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteMonetizationStrategy(
    userId: string, 
    strategyId: string
  ): Promise<void> {
    // Verify ownership
    const existingStrategy = await prisma.monetizationStrategy.findFirst({
      where: { 
        id: strategyId,
        project: { userId }
      },
    });

    if (!existingStrategy) {
      throw new Error('Monetization strategy not found or access denied');
    }

    await prisma.monetizationStrategy.delete({
      where: { id: strategyId },
    });
  }

  // Analytics and Reporting
  async getRevenueTrackingSummary(userId: string): Promise<RevenueTrackingSummary> {
    const userProjects = await prisma.project.findMany({
      where: { userId, revenueTracking: true },
      include: {
        revenueMetrics: {
          where: { metricType: 'revenue' },
          orderBy: { date: 'desc' },
        },
      },
    });

    let totalRevenue = 0;
    const topRevenueSources: Array<{
      projectId: string;
      projectTitle: string;
      revenue: number;
    }> = [];

    // Calculate total revenue and top sources
    userProjects.forEach(project => {
      const projectRevenue = project.revenueMetrics.reduce((sum, metric) => sum + metric.value, 0);
      totalRevenue += projectRevenue;
      
      if (projectRevenue > 0) {
        topRevenueSources.push({
          projectId: project.id,
          projectTitle: project.title,
          revenue: projectRevenue,
        });
      }
    });

    // Sort by revenue and take top 5
    topRevenueSources.sort((a, b) => b.revenue - a.revenue);
    const top5RevenueSources = topRevenueSources.slice(0, 5);

    // Calculate monthly growth
    const monthlyGrowth = this.calculateMonthlyGrowth(userProjects);

    // Get conversion rates
    const conversionRates = await this.getConversionRates(userId);

    return {
      totalRevenue,
      monthlyGrowth,
      topRevenueSources: top5RevenueSources,
      conversionRates,
    };
  }

  async getProjectRevenueAnalysis(userId: string, projectId: string): Promise<any> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const revenueMetrics = await prisma.revenueMetric.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    });

    const projectAnalytics = await prisma.projectAnalytics.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    });

    const monetizationStrategies = await prisma.monetizationStrategy.findMany({
      where: { projectId },
      orderBy: { priority: 'desc' },
    });

    // Calculate revenue trends
    const revenueTrends = this.calculateRevenueTrends(revenueMetrics);
    
    // Calculate user engagement trends
    const engagementTrends = this.calculateEngagementTrends(projectAnalytics);

    // Analyze monetization strategies
    const strategyAnalysis = this.analyzeMonetizationStrategies(monetizationStrategies);

    return {
      projectTitle: project.title,
      revenueMetrics,
      projectAnalytics,
      monetizationStrategies,
      revenueTrends,
      engagementTrends,
      strategyAnalysis,
      summary: this.generateProjectRevenueSummary(revenueMetrics, projectAnalytics, monetizationStrategies),
    };
  }

  async getUserRevenueMetrics(userId: string): Promise<RevenueMetricWithProject[]> {
    return await prisma.revenueMetric.findMany({
      where: {
        project: { userId }
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getUserMonetizationStrategies(userId: string): Promise<MonetizationStrategyWithProject[]> {
    return await prisma.monetizationStrategy.findMany({
      where: {
        project: { userId }
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });
  }

  // Private helper methods
  private calculateMonthlyGrowth(projects: any[]): number {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let lastMonthRevenue = 0;
    let thisMonthRevenue = 0;

    projects.forEach(project => {
      project.revenueMetrics.forEach((metric: any) => {
        const metricDate = new Date(metric.date);
        if (metricDate >= lastMonth && metricDate < thisMonth) {
          lastMonthRevenue += metric.value;
        } else if (metricDate >= thisMonth) {
          thisMonthRevenue += metric.value;
        }
      });
    });

    if (lastMonthRevenue === 0) return 0;
    return ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  }

  private async getConversionRates(userId: string): Promise<Array<{
    metricName: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    const conversionMetrics = await prisma.revenueMetric.findMany({
      where: {
        project: { userId },
        metricType: 'conversion',
      },
      orderBy: { date: 'desc' },
    });

    // Group by metric name and calculate trends
    const metricGroups = new Map<string, number[]>();
    conversionMetrics.forEach(metric => {
      if (!metricGroups.has(metric.metricName)) {
        metricGroups.set(metric.metricName, []);
      }
      metricGroups.get(metric.metricName)!.push(metric.value);
    });

    const conversionRates: Array<{
      metricName: string;
      value: number;
      trend: 'up' | 'down' | 'stable';
    }> = [];

    metricGroups.forEach((values, metricName) => {
      const latestValue = values[0];
      const previousValue = values[1] || latestValue;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (latestValue > previousValue * 1.05) trend = 'up';
      else if (latestValue < previousValue * 0.95) trend = 'down';

      conversionRates.push({
        metricName,
        value: latestValue,
        trend,
      });
    });

    return conversionRates;
  }

  private calculateRevenueTrends(revenueMetrics: RevenueMetric[]): any {
    const revenueByMonth = new Map<string, number>();
    
    revenueMetrics.forEach(metric => {
      const monthKey = new Date(metric.date).toISOString().slice(0, 7); // YYYY-MM
      revenueByMonth.set(monthKey, (revenueByMonth.get(monthKey) || 0) + metric.value);
    });

    return Array.from(revenueByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  }

  private calculateEngagementTrends(analytics: ProjectAnalytics[]): any {
    const engagementByMonth = new Map<string, number>();
    
    analytics
      .filter(a => a.analyticsType === 'user_engagement')
      .forEach(analytic => {
        const monthKey = new Date(analytic.date).toISOString().slice(0, 7);
        engagementByMonth.set(monthKey, (engagementByMonth.get(monthKey) || 0) + analytic.value);
      });

    return Array.from(engagementByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, engagement]) => ({ month, engagement }));
  }

  private analyzeMonetizationStrategies(strategies: MonetizationStrategy[]): any {
    const strategyTypes = new Map<string, number>();
    const activeStrategies = strategies.filter(s => s.status === 'ACTIVE').length;
    const totalProjectedRevenue = strategies.reduce((sum, s) => sum + (s.revenueProjection || 0), 0);

    strategies.forEach(strategy => {
      strategyTypes.set(strategy.strategyType, (strategyTypes.get(strategy.strategyType) || 0) + 1);
    });

    return {
      totalStrategies: strategies.length,
      activeStrategies,
      totalProjectedRevenue,
      strategyTypeBreakdown: Array.from(strategyTypes.entries()),
      topStrategies: strategies
        .sort((a, b) => (b.revenueProjection || 0) - (a.revenueProjection || 0))
        .slice(0, 3),
    };
  }

  private generateProjectRevenueSummary(
    revenueMetrics: RevenueMetric[],
    analytics: ProjectAnalytics[],
    strategies: MonetizationStrategy[]
  ): any {
    const totalRevenue = revenueMetrics.reduce((sum, m) => sum + m.value, 0);
    const totalProjectedRevenue = strategies.reduce((sum, s) => sum + (s.revenueProjection || 0), 0);
    const activeStrategies = strategies.filter(s => s.status === 'ACTIVE').length;

    return {
      totalRevenue,
      totalProjectedRevenue,
      activeStrategies,
      revenueEfficiency: totalProjectedRevenue > 0 ? (totalRevenue / totalProjectedRevenue) * 100 : 0,
      recommendations: this.generateRevenueRecommendations(revenueMetrics, analytics, strategies),
    };
  }

  private generateRevenueRecommendations(
    revenueMetrics: RevenueMetric[],
    analytics: ProjectAnalytics[],
    strategies: MonetizationStrategy[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (revenueMetrics.length === 0) {
      recommendations.push('Start tracking revenue metrics to understand monetization performance');
      recommendations.push('Implement basic analytics to measure user engagement');
    }

    if (strategies.length === 0) {
      recommendations.push('Develop monetization strategies for your projects');
      recommendations.push('Consider multiple revenue streams (subscription, ads, marketplace)');
    }

    const recentRevenue = revenueMetrics
      .filter(m => new Date(m.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, m) => sum + m.value, 0);

    if (recentRevenue === 0 && strategies.length > 0) {
      recommendations.push('Focus on implementing active monetization strategies');
      recommendations.push('Consider A/B testing different pricing models');
    }

    return recommendations;
  }
} 
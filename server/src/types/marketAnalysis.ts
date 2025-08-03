import { MarketResearch, RevenueMetric, ProjectAnalytics, MonetizationStrategy } from '@prisma/client';

export type ResearchType = 'market_analysis' | 'competition_analysis' | 'opportunity_assessment';
export type MarketSize = 'small' | 'medium' | 'large' | 'enterprise';
export type CompetitionLevel = 'low' | 'medium' | 'high';
export type MonetizationPotential = 'low' | 'medium' | 'high';
export type MetricType = 'user_engagement' | 'revenue' | 'conversion' | 'retention';
export type AnalyticsType = 'page_views' | 'user_engagement' | 'conversion' | 'retention';
export type StrategyType = 'subscription' | 'freemium' | 'ads' | 'marketplace' | 'saas';
export type StrategyStatus = 'PLANNING' | 'IMPLEMENTING' | 'ACTIVE' | 'PAUSED';

export interface CreateMarketResearchData {
  researchType: ResearchType;
  title: string;
  description: string;
  targetMarket?: string;
  marketSize?: MarketSize;
  competitionLevel?: CompetitionLevel;
  entryBarriers?: string;
  monetizationPotential?: MonetizationPotential;
  researchData: Record<string, any>;
  insights?: string;
  recommendations?: string;
}

export interface UpdateMarketResearchData {
  researchType?: ResearchType;
  title?: string;
  description?: string;
  targetMarket?: string;
  marketSize?: MarketSize;
  competitionLevel?: CompetitionLevel;
  entryBarriers?: string;
  monetizationPotential?: MonetizationPotential;
  researchData?: Record<string, any>;
  insights?: string;
  recommendations?: string;
}

export interface CreateRevenueMetricData {
  metricType: MetricType;
  metricName: string;
  value: number;
  unit: string;
  period: string;
  date: Date;
  notes?: string;
}

export interface UpdateRevenueMetricData {
  metricType?: MetricType;
  metricName?: string;
  value?: number;
  unit?: string;
  period?: string;
  date?: Date;
  notes?: string;
}

export interface CreateProjectAnalyticsData {
  analyticsType: AnalyticsType;
  metricName: string;
  value: number;
  date: Date;
  metadata?: Record<string, any>;
}

export interface CreateMonetizationStrategyData {
  strategyType: StrategyType;
  title: string;
  description: string;
  targetAudience?: string;
  pricingModel?: string;
  revenueProjection?: number;
  implementationPlan?: string;
  status?: StrategyStatus;
  priority?: string;
}

export interface UpdateMonetizationStrategyData {
  strategyType?: StrategyType;
  title?: string;
  description?: string;
  targetAudience?: string;
  pricingModel?: string;
  revenueProjection?: number;
  implementationPlan?: string;
  status?: StrategyStatus;
  priority?: string;
}

export interface MarketResearchWithProject extends MarketResearch {
  project: {
    id: string;
    title: string;
    status: string;
  };
}

export interface RevenueMetricWithProject extends RevenueMetric {
  project: {
    id: string;
    title: string;
    status: string;
  };
}

export interface ProjectAnalyticsWithProject extends ProjectAnalytics {
  project: {
    id: string;
    title: string;
    status: string;
  };
}

export interface MonetizationStrategyWithProject extends MonetizationStrategy {
  project: {
    id: string;
    title: string;
    status: string;
  };
}

export interface MarketAnalysisSummary {
  totalResearch: number;
  highPotentialProjects: number;
  averageCompetitionLevel: string;
  topMonetizationStrategies: string[];
  revenueMetrics: {
    totalRevenue: number;
    averageRevenue: number;
    topPerformingProject: string;
  };
}

export interface RevenueTrackingSummary {
  totalRevenue: number;
  monthlyGrowth: number;
  topRevenueSources: Array<{
    projectId: string;
    projectTitle: string;
    revenue: number;
  }>;
  conversionRates: Array<{
    metricName: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }>;
} 
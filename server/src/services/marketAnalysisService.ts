import { PrismaClient, MarketResearch, Project } from '@prisma/client';
import { 
  CreateMarketResearchData, 
  UpdateMarketResearchData, 
  MarketResearchWithProject,
  MarketAnalysisSummary,
  ResearchType 
} from '../types/marketAnalysis';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class MarketAnalysisService {
  async createMarketResearch(
    userId: string, 
    projectId: string, 
    data: CreateMarketResearchData
  ): Promise<MarketResearch> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.marketResearch.create({
      data: {
        projectId,
        researchType: data.researchType,
        title: data.title,
        description: data.description,
        targetMarket: data.targetMarket,
        marketSize: data.marketSize,
        competitionLevel: data.competitionLevel,
        entryBarriers: data.entryBarriers,
        monetizationPotential: data.monetizationPotential,
        researchData: JSON.stringify(data.researchData),
        insights: data.insights,
        recommendations: data.recommendations,
      },
    });
  }

  async getProjectMarketResearch(
    userId: string, 
    projectId: string
  ): Promise<MarketResearch[]> {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return await prisma.marketResearch.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMarketResearchById(
    userId: string, 
    researchId: string
  ): Promise<MarketResearchWithProject | null> {
    return await prisma.marketResearch.findFirst({
      where: { 
        id: researchId,
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
    });
  }

  async updateMarketResearch(
    userId: string, 
    researchId: string, 
    data: UpdateMarketResearchData
  ): Promise<MarketResearch> {
    // Verify ownership
    const existingResearch = await prisma.marketResearch.findFirst({
      where: { 
        id: researchId,
        project: { userId }
      },
    });

    if (!existingResearch) {
      throw new Error('Market research not found or access denied');
    }

    const updateData: any = { ...data };
    if (data.researchData) {
      updateData.researchData = JSON.stringify(data.researchData);
    }

    return await prisma.marketResearch.update({
      where: { id: researchId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  }

  async deleteMarketResearch(
    userId: string, 
    researchId: string
  ): Promise<void> {
    // Verify ownership
    const existingResearch = await prisma.marketResearch.findFirst({
      where: { 
        id: researchId,
        project: { userId }
      },
    });

    if (!existingResearch) {
      throw new Error('Market research not found or access denied');
    }

    await prisma.marketResearch.delete({
      where: { id: researchId },
    });
  }

  async getUserMarketResearch(userId: string): Promise<MarketResearchWithProject[]> {
    return await prisma.marketResearch.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMarketAnalysisSummary(userId: string): Promise<MarketAnalysisSummary> {
    const userResearch = await this.getUserMarketResearch(userId);
    
    const totalResearch = userResearch.length;
    const highPotentialProjects = userResearch.filter(
      research => research.monetizationPotential === 'high'
    ).length;

    // Calculate average competition level
    const competitionLevels = userResearch
      .map(r => r.competitionLevel)
      .filter((level): level is string => level !== null && level !== undefined);
    
    const averageCompetitionLevel = this.calculateAverageCompetitionLevel(competitionLevels);

    // Get top monetization strategies
    const topMonetizationStrategies = this.getTopMonetizationStrategies(userResearch);

    // Get revenue metrics (this will be enhanced when revenue tracking is implemented)
    const revenueMetrics = {
      totalRevenue: 0, // Will be calculated from revenue metrics
      averageRevenue: 0,
      topPerformingProject: 'No revenue data yet',
    };

    return {
      totalResearch,
      highPotentialProjects,
      averageCompetitionLevel,
      topMonetizationStrategies,
      revenueMetrics,
    };
  }

  async getCompetitionAnalysis(userId: string, projectId: string): Promise<any> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Get market research for this project
    const marketResearch = await prisma.marketResearch.findMany({
      where: { 
        projectId,
        researchType: 'competition_analysis'
      },
      orderBy: { createdAt: 'desc' },
    });

    // Analyze competition data
    const competitionData = marketResearch.map(research => {
      const data = JSON.parse(research.researchData);
      return {
        id: research.id,
        title: research.title,
        competitionLevel: research.competitionLevel,
        entryBarriers: research.entryBarriers,
        insights: research.insights,
        recommendations: research.recommendations,
        data,
      };
    });

    return {
      projectTitle: project.title,
      totalAnalyses: competitionData.length,
      competitionData,
      summary: this.generateCompetitionSummary(competitionData),
    };
  }

  async getOpportunityAssessment(userId: string, projectId: string): Promise<any> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Get opportunity assessment research
    const opportunityResearch = await prisma.marketResearch.findMany({
      where: { 
        projectId,
        researchType: 'opportunity_assessment'
      },
      orderBy: { createdAt: 'desc' },
    });

    // Analyze opportunity data
    const opportunityData = opportunityResearch.map(research => {
      const data = JSON.parse(research.researchData);
      return {
        id: research.id,
        title: research.title,
        targetMarket: research.targetMarket,
        marketSize: research.marketSize,
        monetizationPotential: research.monetizationPotential,
        insights: research.insights,
        recommendations: research.recommendations,
        data,
      };
    });

    return {
      projectTitle: project.title,
      totalAssessments: opportunityData.length,
      opportunityData,
      summary: this.generateOpportunitySummary(opportunityData),
    };
  }

  private calculateAverageCompetitionLevel(levels: string[]): string {
    if (levels.length === 0) return 'unknown';
    
    const levelScores = levels.map(level => {
      switch (level) {
        case 'low': return 1;
        case 'medium': return 2;
        case 'high': return 3;
        default: return 2;
      }
    });

    const averageScore = levelScores.reduce((sum, score) => sum + score, 0) / levelScores.length;
    
    if (averageScore <= 1.5) return 'low';
    if (averageScore <= 2.5) return 'medium';
    return 'high';
  }

  private getTopMonetizationStrategies(research: MarketResearchWithProject[]): string[] {
    const strategies = new Map<string, number>();
    
    research.forEach(item => {
      if (item.monetizationPotential === 'high') {
        const projectTitle = item.project.title;
        strategies.set(projectTitle, (strategies.get(projectTitle) || 0) + 1);
      }
    });

    return Array.from(strategies.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title]) => title);
  }

  private generateCompetitionSummary(competitionData: any[]): any {
    const totalAnalyses = competitionData.length;
    const highCompetition = competitionData.filter(d => d.competitionLevel === 'high').length;
    const lowCompetition = competitionData.filter(d => d.competitionLevel === 'low').length;

    return {
      totalAnalyses,
      highCompetition,
      lowCompetition,
      competitionRatio: totalAnalyses > 0 ? (highCompetition / totalAnalyses) : 0,
      recommendations: this.generateCompetitionRecommendations(competitionData),
    };
  }

  private generateOpportunitySummary(opportunityData: any[]): any {
    const totalAssessments = opportunityData.length;
    const highPotential = opportunityData.filter(d => d.monetizationPotential === 'high').length;
    const largeMarket = opportunityData.filter(d => d.marketSize === 'large' || d.marketSize === 'enterprise').length;

    return {
      totalAssessments,
      highPotential,
      largeMarket,
      opportunityScore: totalAssessments > 0 ? (highPotential / totalAssessments) : 0,
      recommendations: this.generateOpportunityRecommendations(opportunityData),
    };
  }

  private generateCompetitionRecommendations(competitionData: any[]): string[] {
    const recommendations: string[] = [];
    
    const highCompetitionCount = competitionData.filter(d => d.competitionLevel === 'high').length;
    const lowCompetitionCount = competitionData.filter(d => d.competitionLevel === 'low').length;

    if (highCompetitionCount > lowCompetitionCount) {
      recommendations.push('Focus on differentiation and unique value propositions');
      recommendations.push('Consider niche markets with less competition');
      recommendations.push('Emphasize technical innovation and advanced features');
    } else {
      recommendations.push('Market appears less saturated - focus on rapid execution');
      recommendations.push('Consider being first to market with key features');
      recommendations.push('Build strong brand recognition early');
    }

    return recommendations;
  }

  private generateOpportunityRecommendations(opportunityData: any[]): string[] {
    const recommendations: string[] = [];
    
    const highPotentialCount = opportunityData.filter(d => d.monetizationPotential === 'high').length;
    const largeMarketCount = opportunityData.filter(d => d.marketSize === 'large' || d.marketSize === 'enterprise').length;

    if (highPotentialCount > 0) {
      recommendations.push('Focus on projects with high monetization potential');
      recommendations.push('Develop clear pricing strategies for high-value features');
      recommendations.push('Consider multiple revenue streams for high-potential projects');
    }

    if (largeMarketCount > 0) {
      recommendations.push('Large market opportunities identified - focus on scalability');
      recommendations.push('Consider enterprise features and integrations');
      recommendations.push('Build for scale from the beginning');
    }

    return recommendations;
  }
} 
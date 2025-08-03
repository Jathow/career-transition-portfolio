import { MarketAnalysisService } from '../services/marketAnalysisService';
import { CreateMarketResearchData } from '../types/marketAnalysis';

// Mock the entire PrismaClient module
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    project: {
      findFirst: jest.fn(),
    },
    marketResearch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('MarketAnalysisService', () => {
  let service: MarketAnalysisService;
  const mockUserId = 'user-123';
  const mockProjectId = 'project-123';

  beforeEach(() => {
    service = new MarketAnalysisService();
    jest.clearAllMocks();
  });

  describe('createMarketResearch', () => {
    const mockData: CreateMarketResearchData = {
      researchType: 'market_analysis',
      title: 'Test Market Research',
      description: 'Test description',
      targetMarket: 'Small businesses',
      marketSize: 'medium',
      competitionLevel: 'medium',
      entryBarriers: 'High development costs',
      monetizationPotential: 'high',
      researchData: { key: 'value' },
      insights: 'Test insights',
      recommendations: 'Test recommendations',
    };

    it('should create market research successfully', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue({ id: mockProjectId, userId: mockUserId });
      mockPrisma.marketResearch.create.mockResolvedValue({
        id: 'research-123',
        ...mockData,
        researchData: JSON.stringify(mockData.researchData),
      });

      const result = await service.createMarketResearch(mockUserId, mockProjectId, mockData);

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: mockProjectId, userId: mockUserId },
      });
      expect(mockPrisma.marketResearch.create).toHaveBeenCalledWith({
        data: {
          projectId: mockProjectId,
          researchType: mockData.researchType,
          title: mockData.title,
          description: mockData.description,
          targetMarket: mockData.targetMarket,
          marketSize: mockData.marketSize,
          competitionLevel: mockData.competitionLevel,
          entryBarriers: mockData.entryBarriers,
          monetizationPotential: mockData.monetizationPotential,
          researchData: JSON.stringify(mockData.researchData),
          insights: mockData.insights,
          recommendations: mockData.recommendations,
        },
      });
      expect(result).toHaveProperty('id', 'research-123');
    });

    it('should throw error if project not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.createMarketResearch(mockUserId, mockProjectId, mockData))
        .rejects.toThrow('Project not found or access denied');
    });
  });

  describe('getProjectMarketResearch', () => {
    it('should return project market research', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockResearch = [
        { id: 'research-1', title: 'Research 1' },
        { id: 'research-2', title: 'Research 2' },
      ];

      mockPrisma.project.findFirst.mockResolvedValue({ id: mockProjectId, userId: mockUserId });
      mockPrisma.marketResearch.findMany.mockResolvedValue(mockResearch);

      const result = await service.getProjectMarketResearch(mockUserId, mockProjectId);

      expect(mockPrisma.marketResearch.findMany).toHaveBeenCalledWith({
        where: { projectId: mockProjectId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockResearch);
    });

    it('should throw error if project not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.getProjectMarketResearch(mockUserId, mockProjectId))
        .rejects.toThrow('Project not found or access denied');
    });
  });

  describe('getMarketResearchById', () => {
    it('should return market research by id', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockResearch = {
        id: 'research-123',
        title: 'Test Research',
        project: { id: mockProjectId, title: 'Test Project', status: 'ACTIVE' },
      };

      mockPrisma.marketResearch.findFirst.mockResolvedValue(mockResearch);

      const result = await service.getMarketResearchById(mockUserId, 'research-123');

      expect(mockPrisma.marketResearch.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'research-123',
          project: { userId: mockUserId },
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
      expect(result).toEqual(mockResearch);
    });

    it('should return null if research not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.marketResearch.findFirst.mockResolvedValue(null);

      const result = await service.getMarketResearchById(mockUserId, 'research-123');

      expect(result).toBeNull();
    });
  });

  describe('updateMarketResearch', () => {
    const updateData = {
      title: 'Updated Title',
      description: 'Updated description',
    };

    it('should update market research successfully', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockResearch = { id: 'research-123', project: { userId: mockUserId } };
      const updatedResearch = { ...mockResearch, ...updateData };

      mockPrisma.marketResearch.findFirst.mockResolvedValue(mockResearch);
      mockPrisma.marketResearch.update.mockResolvedValue(updatedResearch);

      const result = await service.updateMarketResearch(mockUserId, 'research-123', updateData);

      expect(mockPrisma.marketResearch.update).toHaveBeenCalledWith({
        where: { id: 'research-123' },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedResearch);
    });

    it('should throw error if research not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.marketResearch.findFirst.mockResolvedValue(null);

      await expect(service.updateMarketResearch(mockUserId, 'research-123', updateData))
        .rejects.toThrow('Market research not found or access denied');
    });
  });

  describe('deleteMarketResearch', () => {
    it('should delete market research successfully', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockResearch = { id: 'research-123', project: { userId: mockUserId } };

      mockPrisma.marketResearch.findFirst.mockResolvedValue(mockResearch);
      mockPrisma.marketResearch.delete.mockResolvedValue(mockResearch);

      await service.deleteMarketResearch(mockUserId, 'research-123');

      expect(mockPrisma.marketResearch.delete).toHaveBeenCalledWith({
        where: { id: 'research-123' },
      });
    });

    it('should throw error if research not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.marketResearch.findFirst.mockResolvedValue(null);

      await expect(service.deleteMarketResearch(mockUserId, 'research-123'))
        .rejects.toThrow('Market research not found or access denied');
    });
  });

  describe('getUserMarketResearch', () => {
    it('should return user market research', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockResearch = [
        {
          id: 'research-1',
          title: 'Research 1',
          project: { id: 'project-1', title: 'Project 1', status: 'ACTIVE' },
        },
      ];

      mockPrisma.marketResearch.findMany.mockResolvedValue(mockResearch);

      const result = await service.getUserMarketResearch(mockUserId);

      expect(mockPrisma.marketResearch.findMany).toHaveBeenCalledWith({
        where: {
          project: { userId: mockUserId },
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
      expect(result).toEqual(mockResearch);
    });
  });

  describe('getMarketAnalysisSummary', () => {
    it('should return market analysis summary', async () => {
      const mockResearch = [
        {
          id: 'research-1',
          projectId: 'project-1',
          researchType: 'market_analysis',
          title: 'Research 1',
          description: 'Test research 1',
          targetMarket: 'Small businesses',
          marketSize: 'medium',
          competitionLevel: 'medium',
          entryBarriers: 'High costs',
          monetizationPotential: 'high',
          researchData: '{"key": "value"}',
          insights: 'Test insights',
          recommendations: 'Test recommendations',
          createdAt: new Date(),
          updatedAt: new Date(),
          project: { id: 'project-1', title: 'Project 1', status: 'ACTIVE' },
        },
        {
          id: 'research-2',
          projectId: 'project-2',
          researchType: 'competition_analysis',
          title: 'Research 2',
          description: 'Test research 2',
          targetMarket: 'Enterprise',
          marketSize: 'large',
          competitionLevel: 'high',
          entryBarriers: 'Regulatory',
          monetizationPotential: 'low',
          researchData: '{"key": "value2"}',
          insights: 'Test insights 2',
          recommendations: 'Test recommendations 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          project: { id: 'project-2', title: 'Project 2', status: 'ACTIVE' },
        },
      ];

      // Mock getUserMarketResearch method
      jest.spyOn(service, 'getUserMarketResearch').mockResolvedValue(mockResearch);

      const result = await service.getMarketAnalysisSummary(mockUserId);

      expect(result).toHaveProperty('totalResearch', 2);
      expect(result).toHaveProperty('highPotentialProjects', 1);
      expect(result).toHaveProperty('averageCompetitionLevel', 'medium');
      expect(result).toHaveProperty('topMonetizationStrategies');
      expect(result).toHaveProperty('revenueMetrics');
    });
  });

  describe('getCompetitionAnalysis', () => {
    it('should return competition analysis', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockProject = { id: mockProjectId, title: 'Test Project' };
      const mockResearch = [
        {
          id: 'research-1',
          researchType: 'competition_analysis',
          title: 'Competition Analysis 1',
          competitionLevel: 'high',
          entryBarriers: 'High costs',
          insights: 'Test insights',
          recommendations: 'Test recommendations',
          researchData: JSON.stringify({ competitors: ['Comp1', 'Comp2'] }),
        },
      ];

      mockPrisma.project.findFirst.mockResolvedValue(mockProject);
      mockPrisma.marketResearch.findMany.mockResolvedValue(mockResearch);

      const result = await service.getCompetitionAnalysis(mockUserId, mockProjectId);

      expect(result).toHaveProperty('projectTitle', 'Test Project');
      expect(result).toHaveProperty('totalAnalyses', 1);
      expect(result).toHaveProperty('competitionData');
      expect(result).toHaveProperty('summary');
    });

    it('should throw error if project not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.getCompetitionAnalysis(mockUserId, mockProjectId))
        .rejects.toThrow('Project not found or access denied');
    });
  });

  describe('getOpportunityAssessment', () => {
    it('should return opportunity assessment', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockProject = { id: mockProjectId, title: 'Test Project' };
      const mockResearch = [
        {
          id: 'research-1',
          researchType: 'opportunity_assessment',
          title: 'Opportunity Assessment 1',
          targetMarket: 'Small businesses',
          marketSize: 'large',
          monetizationPotential: 'high',
          insights: 'Test insights',
          recommendations: 'Test recommendations',
          researchData: JSON.stringify({ opportunities: ['Opp1', 'Opp2'] }),
        },
      ];

      mockPrisma.project.findFirst.mockResolvedValue(mockProject);
      mockPrisma.marketResearch.findMany.mockResolvedValue(mockResearch);

      const result = await service.getOpportunityAssessment(mockUserId, mockProjectId);

      expect(result).toHaveProperty('projectTitle', 'Test Project');
      expect(result).toHaveProperty('totalAssessments', 1);
      expect(result).toHaveProperty('opportunityData');
      expect(result).toHaveProperty('summary');
    });

    it('should throw error if project not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.getOpportunityAssessment(mockUserId, mockProjectId))
        .rejects.toThrow('Project not found or access denied');
    });
  });
}); 
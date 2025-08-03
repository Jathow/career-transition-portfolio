import { RevenueTrackingService } from '../services/revenueTrackingService';
import { CreateRevenueMetricData, CreateMonetizationStrategyData } from '../types/marketAnalysis';

// Mock the entire PrismaClient module
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    project: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    revenueMetric: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectAnalytics: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    monetizationStrategy: {
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

describe('RevenueTrackingService', () => {
  let service: RevenueTrackingService;
  const mockUserId = 'user-123';
  const mockProjectId = 'project-123';

  beforeEach(() => {
    service = new RevenueTrackingService();
    jest.clearAllMocks();
  });

  describe('createRevenueMetric', () => {
    const mockData: CreateRevenueMetricData = {
      metricType: 'revenue',
      metricName: 'Monthly Revenue',
      value: 1000,
      unit: 'dollars',
      period: 'monthly',
      date: new Date('2024-01-01'),
      notes: 'Test notes',
    };

    it('should create revenue metric successfully', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue({ id: mockProjectId, userId: mockUserId });
      mockPrisma.revenueMetric.create.mockResolvedValue({
        id: 'metric-123',
        ...mockData,
      });

      const result = await service.createRevenueMetric(mockUserId, mockProjectId, mockData);

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: mockProjectId, userId: mockUserId },
      });
      expect(mockPrisma.revenueMetric.create).toHaveBeenCalledWith({
        data: {
          projectId: mockProjectId,
          metricType: mockData.metricType,
          metricName: mockData.metricName,
          value: mockData.value,
          unit: mockData.unit,
          period: mockData.period,
          date: mockData.date,
          notes: mockData.notes,
        },
      });
      expect(result).toHaveProperty('id', 'metric-123');
    });

    it('should throw error if project not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.createRevenueMetric(mockUserId, mockProjectId, mockData))
        .rejects.toThrow('Project not found or access denied');
    });
  });

  describe('getProjectRevenueMetrics', () => {
    it('should return project revenue metrics', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockMetrics = [
        { id: 'metric-1', metricName: 'Revenue 1', value: 1000 },
        { id: 'metric-2', metricName: 'Revenue 2', value: 2000 },
      ];

      mockPrisma.project.findFirst.mockResolvedValue({ id: mockProjectId, userId: mockUserId });
      mockPrisma.revenueMetric.findMany.mockResolvedValue(mockMetrics);

      const result = await service.getProjectRevenueMetrics(mockUserId, mockProjectId);

      expect(mockPrisma.revenueMetric.findMany).toHaveBeenCalledWith({
        where: { projectId: mockProjectId },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(mockMetrics);
    });

    it('should throw error if project not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.getProjectRevenueMetrics(mockUserId, mockProjectId))
        .rejects.toThrow('Project not found or access denied');
    });
  });

  describe('createMonetizationStrategy', () => {
    const mockData: CreateMonetizationStrategyData = {
      strategyType: 'subscription',
      title: 'Premium Subscription',
      description: 'Monthly subscription plan',
      targetAudience: 'Small businesses',
      pricingModel: 'Monthly Subscription',
      revenueProjection: 5000,
      implementationPlan: 'Step by step plan',
      status: 'PLANNING',
      priority: 'HIGH',
    };

    it('should create monetization strategy successfully', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue({ id: mockProjectId, userId: mockUserId });
      mockPrisma.monetizationStrategy.create.mockResolvedValue({
        id: 'strategy-123',
        ...mockData,
      });

      const result = await service.createMonetizationStrategy(mockUserId, mockProjectId, mockData);

      expect(mockPrisma.monetizationStrategy.create).toHaveBeenCalledWith({
        data: {
          projectId: mockProjectId,
          strategyType: mockData.strategyType,
          title: mockData.title,
          description: mockData.description,
          targetAudience: mockData.targetAudience,
          pricingModel: mockData.pricingModel,
          revenueProjection: mockData.revenueProjection,
          implementationPlan: mockData.implementationPlan,
          status: mockData.status,
          priority: mockData.priority,
        },
      });
      expect(result).toHaveProperty('id', 'strategy-123');
    });

    it('should throw error if project not found', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.createMonetizationStrategy(mockUserId, mockProjectId, mockData))
        .rejects.toThrow('Project not found or access denied');
    });
  });

  describe('getRevenueTrackingSummary', () => {
    it('should return revenue tracking summary', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      const mockProjects = [
        {
          id: 'project-1',
          title: 'Project 1',
          revenueMetrics: [
            { value: 1000, date: new Date('2024-01-01') },
            { value: 2000, date: new Date('2024-02-01') },
          ],
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);
      mockPrisma.revenueMetric.findMany.mockResolvedValue([]);

      const result = await service.getRevenueTrackingSummary(mockUserId);

      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('monthlyGrowth');
      expect(result).toHaveProperty('topRevenueSources');
      expect(result).toHaveProperty('conversionRates');
    });
  });
}); 
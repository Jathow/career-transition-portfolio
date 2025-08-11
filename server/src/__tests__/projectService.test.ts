import { ProjectService } from '../services/projectService';
import { CreateProjectData, UpdateProjectData } from '../types/project';

// Mock the entire PrismaClient module
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

describe('ProjectService', () => {
  let projectService: ProjectService;
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    projectService = new ProjectService();
  });

  describe('createProject', () => {
    const validProjectData: CreateProjectData = {
      title: 'Test Project',
      description: 'A test project description',
      techStack: ['React', 'TypeScript'],
      targetEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'PLANNING',
      repositoryUrl: 'https://github.com/test/project',
      liveUrl: 'https://test-project.com',
      revenueTracking: false,
      marketResearch: 'Market research notes',
    };

    it('should create a project successfully', async () => {
      const mockProject = {
        id: 'project-123',
        userId: mockUserId,
        ...validProjectData,
        techStack: 'React, TypeScript',
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.create.mockResolvedValue(mockProject);

      const result = await projectService.createProject(mockUserId, validProjectData);

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          title: validProjectData.title,
          description: validProjectData.description,
          techStack: 'React, TypeScript',
          startDate: expect.any(Date),
          targetEndDate: validProjectData.targetEndDate,
          status: 'PLANNING',
          repositoryUrl: validProjectData.repositoryUrl,
          liveUrl: validProjectData.liveUrl,
          revenueTracking: false,
          marketResearch: validProjectData.marketResearch,
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('should allow long-term target end dates beyond 1 week', async () => {
      const longTermProjectData = {
        ...validProjectData,
        targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      } as CreateProjectData;

      const mockProject = {
        id: 'project-long-term',
        userId: mockUserId,
        ...longTermProjectData,
        techStack: 'React, TypeScript',
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.create.mockResolvedValue(mockProject);

      const result = await projectService.createProject(mockUserId, longTermProjectData);
      expect(result).toEqual(mockProject);
    });
  });

  describe('getUserProjects', () => {
    it('should return user projects with progress calculations', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          userId: mockUserId,
          title: 'Project 1',
          description: 'Description 1',
          techStack: 'React, TypeScript',
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          targetEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          actualEndDate: null,
          status: 'IN_PROGRESS',
          repositoryUrl: 'https://github.com/test/project1',
          liveUrl: null,
          revenueTracking: false,
          marketResearch: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await projectService.getUserProjects(mockUserId);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('progress');
      expect(result[0]).toHaveProperty('timeRemaining');
      expect(result[0]).toHaveProperty('isOverdue');
    });
  });

  describe('getProjectById', () => {
    it('should return a specific project', async () => {
      const mockProject = {
        id: 'project-123',
        userId: mockUserId,
        title: 'Test Project',
        description: 'Test Description',
        techStack: 'React, TypeScript',
        startDate: new Date(),
        targetEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        actualEndDate: null,
        status: 'PLANNING',
        repositoryUrl: null,
        liveUrl: null,
        revenueTracking: false,
        marketResearch: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(mockProject);

      const result = await projectService.getProjectById(mockUserId, 'project-123');

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 'project-123', userId: mockUserId },
      });
      expect(result).toMatchObject({
        ...mockProject,
        progress: expect.any(Number),
        timeRemaining: expect.any(Number),
        isOverdue: expect.any(Boolean),
      });
    });

    it('should return null for non-existent project', async () => {
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(null);

      const result = await projectService.getProjectById(mockUserId, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateProject', () => {
    const updateData: UpdateProjectData = {
      title: 'Updated Project',
      description: 'Updated description',
      techStack: ['React', 'TypeScript', 'Node.js'],
      status: 'IN_PROGRESS',
    };

    it('should update a project successfully', async () => {
      const mockUpdatedProject = {
        id: 'project-123',
        userId: mockUserId,
        ...updateData,
        techStack: 'React, TypeScript, Node.js',
        startDate: new Date(),
        targetEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        actualEndDate: null,
        repositoryUrl: null,
        liveUrl: null,
        revenueTracking: false,
        marketResearch: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(mockUpdatedProject);
      mockPrisma.project.update.mockResolvedValue(mockUpdatedProject);

      const result = await projectService.updateProject(mockUserId, 'project-123', updateData);

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 'project-123', userId: mockUserId },
      });
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: {
          ...updateData,
          techStack: 'React, TypeScript, Node.js',
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockUpdatedProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      const mockDeletedProject = {
        id: 'project-123',
        userId: mockUserId,
        title: 'Deleted Project',
        description: 'Description',
        techStack: 'React',
        startDate: new Date(),
        targetEndDate: new Date(),
        actualEndDate: null,
        status: 'PLANNING',
        repositoryUrl: null,
        liveUrl: null,
        revenueTracking: false,
        marketResearch: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(mockDeletedProject);
      mockPrisma.project.delete.mockResolvedValue(mockDeletedProject);

      const result = await projectService.deleteProject(mockUserId, 'project-123');

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 'project-123', userId: mockUserId },
      });
      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-123' },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('completeProject', () => {
    it('should mark a project as completed', async () => {
      const mockCompletedProject = {
        id: 'project-123',
        userId: mockUserId,
        title: 'Completed Project',
        description: 'Description',
        techStack: 'React',
        startDate: new Date(),
        targetEndDate: new Date(),
        actualEndDate: new Date(),
        status: 'COMPLETED',
        repositoryUrl: null,
        liveUrl: null,
        revenueTracking: false,
        marketResearch: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(mockCompletedProject);
      mockPrisma.project.update.mockResolvedValue(mockCompletedProject);

      const result = await projectService.completeProject(mockUserId, 'project-123');

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 'project-123', userId: mockUserId },
      });
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: {
          status: 'COMPLETED',
          actualEndDate: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockCompletedProject);
    });
  });

  describe('updateProjectStatus', () => {
    it('should update project status', async () => {
      const mockUpdatedProject = {
        id: 'project-123',
        userId: mockUserId,
        title: 'Project',
        description: 'Description',
        techStack: 'React',
        startDate: new Date(),
        targetEndDate: new Date(),
        actualEndDate: null,
        status: 'PAUSED',
        repositoryUrl: null,
        liveUrl: null,
        revenueTracking: false,
        marketResearch: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.project.findFirst.mockResolvedValue(mockUpdatedProject);
      mockPrisma.project.update.mockResolvedValue(mockUpdatedProject);

      const result = await projectService.updateProjectStatus(mockUserId, 'project-123', 'PAUSED');

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: 'project-123', userId: mockUserId },
      });
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: {
          status: 'PAUSED',
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockUpdatedProject);
    });
  });
}); 
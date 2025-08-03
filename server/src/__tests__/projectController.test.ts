import request from 'supertest';
import jwt from 'jsonwebtoken';

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
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

import app from '../index';

describe('Project API Endpoints', () => {
  const mockUserId = 'user-123';
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const generateToken = (userId: string, email: string) => {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
  };

  const authToken = generateToken(mockUserId, mockUser.email);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('POST /api/projects', () => {
    const validProjectData = {
      title: 'Test Project',
      description: 'A test project description',
      techStack: ['React', 'TypeScript'],
      targetEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
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

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProjectData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(validProjectData.title);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send(validProjectData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidProjectData = {
        title: '', // Empty title
        description: 'Description',
        techStack: [], // Empty tech stack
        targetEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProjectData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/projects', () => {
    it('should return user projects', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          userId: mockUserId,
          title: 'Project 1',
          description: 'Description 1',
          techStack: 'React, TypeScript',
          startDate: new Date(),
          targetEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          actualEndDate: null,
          status: 'IN_PROGRESS',
          repositoryUrl: null,
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

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects/:id', () => {
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

      const response = await request(app)
        .get('/api/projects/project-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('project-123');
    });
  });

  describe('PUT /api/projects/:id', () => {
    const updateData = {
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

      const response = await request(app)
        .put('/api/projects/project-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/projects/:id', () => {
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

      const response = await request(app)
        .delete('/api/projects/project-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Project deleted successfully');
    });
  });

  describe('POST /api/projects/:id/complete', () => {
    it('should complete a project successfully', async () => {
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

      const response = await request(app)
        .post('/api/projects/project-123/complete')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
    });
  });

  describe('PATCH /api/projects/:id/status', () => {
    it('should update project status successfully', async () => {
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

      const response = await request(app)
        .patch('/api/projects/project-123/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'PAUSED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PAUSED');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .patch('/api/projects/project-123/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid project status');
    });
  });
}); 
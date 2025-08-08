import request from 'supertest';
import app from '../index';
import { ResumeService } from '../services/resumeService';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock the ResumeService
jest.mock('../services/resumeService');
const mockResumeService = ResumeService as jest.Mocked<typeof ResumeService>;

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

const mockPrisma = mockDeep<PrismaClient>();
(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user-id', email: 'test@example.com' };
    next();
  },
}));

describe('ResumeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/resumes/templates', () => {
    test('should return all templates', async () => {
      const mockTemplates = [
        {
          id: 'professional-standard',
          name: 'Professional Standard',
          description: 'Clean, traditional resume format',
          category: 'professional' as const,
          preview: 'Traditional layout with clear sections'
        }
      ];

      mockResumeService.getTemplates.mockResolvedValue(mockTemplates);

      const response = await request(app)
        .get('/api/resumes/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTemplates);
      expect(mockResumeService.getTemplates).toHaveBeenCalled();
    });

    test('should handle service errors', async () => {
      mockResumeService.getTemplates.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/api/resumes/templates')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TEMPLATES_FETCH_ERROR');
    });
  });

  describe('GET /api/resumes/templates/category/:category', () => {
    test('should return templates by category', async () => {
      const mockTemplates = [
        {
          id: 'professional-standard',
          name: 'Professional Standard',
          description: 'Clean, traditional resume format',
          category: 'professional' as const,
          preview: 'Traditional layout with clear sections'
        }
      ];

      mockResumeService.getTemplatesByCategory.mockResolvedValue(mockTemplates);

      const response = await request(app)
        .get('/api/resumes/templates/category/professional')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTemplates);
      expect(mockResumeService.getTemplatesByCategory).toHaveBeenCalledWith('professional');
    });
  });

  describe('GET /api/resumes/templates/:templateId', () => {
    test('should return template by ID', async () => {
      const mockTemplate = {
        id: 'professional-standard',
        name: 'Professional Standard',
        description: 'Clean, traditional resume format',
        category: 'professional' as const,
        preview: 'Traditional layout with clear sections'
      };

      mockResumeService.getTemplateById.mockResolvedValue(mockTemplate);

      const response = await request(app)
        .get('/api/resumes/templates/professional-standard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTemplate);
    });

    test('should return 404 for non-existent template', async () => {
      mockResumeService.getTemplateById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/resumes/templates/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TEMPLATE_NOT_FOUND');
    });
  });

  describe('POST /api/resumes', () => {
    test('should create a new resume', async () => {
      const resumeData = {
        versionName: 'Test Resume',
        templateId: 'professional-standard',
        content: {
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          summary: 'Test summary',
          experience: [],
          projects: [],
          skills: { technical: [], soft: [] },
          education: []
        },
        isDefault: true
      };

      const mockCreatedResume = {
        id: 'resume-123',
        userId: 'test-user-id',
        ...resumeData,
        content: JSON.stringify(resumeData.content),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockResumeService.createResume.mockResolvedValue(mockCreatedResume);

      const response = await request(app)
        .post('/api/resumes')
        .send(resumeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockCreatedResume.id);
      expect(response.body.data.userId).toBe(mockCreatedResume.userId);
      expect(response.body.data.versionName).toBe(mockCreatedResume.versionName);
      expect(response.body.data.templateId).toBe(mockCreatedResume.templateId);
      expect(response.body.data.content).toBe(mockCreatedResume.content);
      expect(response.body.data.isDefault).toBe(mockCreatedResume.isDefault);
      expect(mockResumeService.createResume).toHaveBeenCalledWith(
        'test-user-id',
        resumeData.versionName,
        resumeData.templateId,
        resumeData.content,
        resumeData.isDefault
      );
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({ versionName: 'Test Resume' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
    });
  });

  describe('GET /api/resumes', () => {
    test('should return user resumes', async () => {
              const mockResumes = [
          {
            id: 'resume-1',
            userId: 'test-user-id',
            versionName: 'Resume 1',
            templateId: 'professional-standard',
            content: '{}',
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

      mockResumeService.getUserResumes.mockResolvedValue(mockResumes);

      const response = await request(app)
        .get('/api/resumes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(mockResumes[0].id);
      expect(response.body.data[0].userId).toBe(mockResumes[0].userId);
      expect(response.body.data[0].versionName).toBe(mockResumes[0].versionName);
      expect(mockResumeService.getUserResumes).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('GET /api/resumes/:resumeId', () => {
    test('should return resume by ID', async () => {
      const mockResume = {
        id: 'resume-123',
        userId: 'test-user-id',
        versionName: 'Test Resume',
        templateId: 'professional-standard',
        content: '{}',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockResumeService.getResumeById.mockResolvedValue(mockResume);

      const response = await request(app)
        .get('/api/resumes/resume-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockResume.id);
      expect(response.body.data.userId).toBe(mockResume.userId);
      expect(response.body.data.versionName).toBe(mockResume.versionName);
      expect(response.body.data.templateId).toBe(mockResume.templateId);
      expect(response.body.data.content).toBe(mockResume.content);
      expect(response.body.data.isDefault).toBe(mockResume.isDefault);
    });

    test('should return 404 for non-existent resume', async () => {
      mockResumeService.getResumeById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/resumes/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESUME_NOT_FOUND');
    });
  });

  describe('PUT /api/resumes/:resumeId', () => {
    test('should update resume', async () => {
      const updateData = {
        versionName: 'Updated Resume',
        templateId: 'technical-developer'
      };

              const mockUpdatedResume = {
          id: 'resume-123',
          userId: 'test-user-id',
          ...updateData,
          content: '{}',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

      mockResumeService.updateResume.mockResolvedValue(mockUpdatedResume);

      const response = await request(app)
        .put('/api/resumes/resume-123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockUpdatedResume.id);
      expect(response.body.data.userId).toBe(mockUpdatedResume.userId);
      expect(response.body.data.versionName).toBe(mockUpdatedResume.versionName);
      expect(response.body.data.templateId).toBe(mockUpdatedResume.templateId);
      expect(response.body.data.content).toBe(mockUpdatedResume.content);
      expect(response.body.data.isDefault).toBe(mockUpdatedResume.isDefault);
      expect(mockResumeService.updateResume).toHaveBeenCalledWith(
        'resume-123',
        'test-user-id',
        updateData
      );
    });

    test('should return 404 for non-existent resume', async () => {
      mockResumeService.updateResume.mockRejectedValue(new Error('Resume not found'));

      const response = await request(app)
        .put('/api/resumes/non-existent')
        .send({ versionName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESUME_NOT_FOUND');
    });
  });

  describe('DELETE /api/resumes/:resumeId', () => {
    test('should delete resume', async () => {
      mockResumeService.deleteResume.mockResolvedValue();

      const response = await request(app)
        .delete('/api/resumes/resume-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockResumeService.deleteResume).toHaveBeenCalledWith('resume-123', 'test-user-id');
    });

    test('should return 404 for non-existent resume', async () => {
      mockResumeService.deleteResume.mockRejectedValue(new Error('Resume not found'));

      const response = await request(app)
        .delete('/api/resumes/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESUME_NOT_FOUND');
    });
  });

  describe('POST /api/resumes/:resumeId/default', () => {
    test('should set resume as default', async () => {
      const mockResume = {
        id: 'resume-123',
        userId: 'test-user-id',
        versionName: 'Test Resume',
        templateId: 'professional-standard',
        content: '{}',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockResumeService.setDefaultResume.mockResolvedValue(mockResume);

      const response = await request(app)
        .post('/api/resumes/resume-123/default')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockResume.id);
      expect(response.body.data.userId).toBe(mockResume.userId);
      expect(response.body.data.versionName).toBe(mockResume.versionName);
      expect(response.body.data.templateId).toBe(mockResume.templateId);
      expect(response.body.data.content).toBe(mockResume.content);
      expect(response.body.data.isDefault).toBe(mockResume.isDefault);
      expect(mockResumeService.setDefaultResume).toHaveBeenCalledWith('resume-123', 'test-user-id');
    });
  });

  describe('GET /api/resumes/default', () => {
    test('should return default resume', async () => {
      const mockResume = {
        id: 'resume-123',
        userId: 'test-user-id',
        versionName: 'Default Resume',
        templateId: 'professional-standard',
        content: '{}',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockResumeService.getDefaultResume.mockResolvedValue(mockResume);

      const response = await request(app)
        .get('/api/resumes/default')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockResume.id);
      expect(response.body.data.userId).toBe(mockResume.userId);
      expect(response.body.data.versionName).toBe(mockResume.versionName);
      expect(response.body.data.templateId).toBe(mockResume.templateId);
      expect(response.body.data.content).toBe(mockResume.content);
      expect(response.body.data.isDefault).toBe(mockResume.isDefault);
    });

    test('should return 404 when no default resume exists', async () => {
      mockResumeService.getDefaultResume.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/resumes/default')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_DEFAULT_RESUME');
    });
  });

  describe('GET /api/resumes/generate/content', () => {
    test('should generate resume content', async () => {
      const mockContent = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        summary: 'Test summary',
        experience: [],
        projects: [],
        skills: { technical: [], soft: [] },
        education: []
      };

      mockResumeService.generateResumeContent.mockResolvedValue(mockContent);

      const response = await request(app)
        .get('/api/resumes/generate/content')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockContent);
      expect(mockResumeService.generateResumeContent).toHaveBeenCalledWith('test-user-id');
    });
  });

  // Export route removed
}); 
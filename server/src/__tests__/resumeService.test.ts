// Mock the logger to avoid console output during tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { ResumeService, ResumeContent } from '../services/resumeService';
import { mockPrismaClient } from './setup';

describe('ResumeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Management', () => {
    test('should return all available templates', async () => {
      const templates = await ResumeService.getTemplates();
      
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      
      // Check template structure
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('preview');
      });
    });

    test('should return template by ID', async () => {
      const template = await ResumeService.getTemplateById('professional-standard');
      
      expect(template).toBeDefined();
      expect(template?.id).toBe('professional-standard');
      expect(template?.name).toBe('Professional Standard');
    });

    test('should return null for non-existent template', async () => {
      const template = await ResumeService.getTemplateById('non-existent');
      
      expect(template).toBeNull();
    });

    test('should return templates by category', async () => {
      const professionalTemplates = await ResumeService.getTemplatesByCategory('professional');
      
      expect(professionalTemplates).toBeDefined();
      expect(Array.isArray(professionalTemplates)).toBe(true);
      professionalTemplates.forEach(template => {
        expect(template.category).toBe('professional');
      });
    });
  });

  describe('Resume CRUD Operations', () => {
    const mockUserId = 'user-123';
    const mockResumeId = 'resume-123';
    const mockResumeData = {
      versionName: 'Test Resume',
      templateId: 'professional-standard',
      content: JSON.stringify({
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
      }),
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    test('should create a new resume', async () => {
      mockPrismaClient.resume.findMany.mockResolvedValue([]);
      mockPrismaClient.resume.create.mockResolvedValue({
        id: mockResumeId,
        userId: mockUserId,
        ...mockResumeData
      });

      const result = await ResumeService.createResume(
        mockUserId,
        mockResumeData.versionName,
        mockResumeData.templateId,
        JSON.parse(mockResumeData.content),
        true
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockResumeId);
      expect(result.userId).toBe(mockUserId);
      expect(mockPrismaClient.resume.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          versionName: mockResumeData.versionName,
          templateId: mockResumeData.templateId,
          content: mockResumeData.content,
          isDefault: true
        }
      });
    });

    test('should get user resumes', async () => {
      const mockResumes = [
        { id: 'resume-1', userId: mockUserId, ...mockResumeData },
        { id: 'resume-2', userId: mockUserId, ...mockResumeData }
      ];

      mockPrismaClient.resume.findMany.mockResolvedValue(mockResumes);

      const result = await ResumeService.getUserResumes(mockUserId);

      expect(result).toEqual(mockResumes);
      expect(mockPrismaClient.resume.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { updatedAt: 'desc' }
      });
    });

    test('should get resume by ID', async () => {
      const mockResume = { id: mockResumeId, userId: mockUserId, ...mockResumeData };
      mockPrismaClient.resume.findFirst.mockResolvedValue(mockResume);

      const result = await ResumeService.getResumeById(mockResumeId, mockUserId);

      expect(result).toEqual(mockResume);
      expect(mockPrismaClient.resume.findFirst).toHaveBeenCalledWith({
        where: { id: mockResumeId, userId: mockUserId }
      });
    });

    test('should update resume', async () => {
      const updatedData = { versionName: 'Updated Resume' };
      const mockResume = { id: mockResumeId, userId: mockUserId, ...mockResumeData, ...updatedData };
      
      mockPrismaClient.resume.findFirst.mockResolvedValue(mockResume);
      mockPrismaClient.resume.update.mockResolvedValue(mockResume);

      const result = await ResumeService.updateResume(mockResumeId, mockUserId, updatedData);

      expect(result).toEqual(mockResume);
      expect(mockPrismaClient.resume.update).toHaveBeenCalledWith({
        where: { id: mockResumeId },
        data: updatedData
      });
    });

    test('should delete resume', async () => {
      mockPrismaClient.resume.findFirst.mockResolvedValue({ id: mockResumeId, userId: mockUserId });
      mockPrismaClient.resume.delete.mockResolvedValue({ id: mockResumeId });

      await ResumeService.deleteResume(mockResumeId, mockUserId);

      expect(mockPrismaClient.resume.delete).toHaveBeenCalledWith({
        where: { id: mockResumeId }
      });
    });

    test('should set resume as default', async () => {
      const mockResume = { id: mockResumeId, userId: mockUserId, ...mockResumeData };
      mockPrismaClient.resume.findFirst.mockResolvedValue(mockResume);
      mockPrismaClient.resume.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaClient.resume.update.mockResolvedValue(mockResume);

      const result = await ResumeService.setDefaultResume(mockResumeId, mockUserId);

      expect(result).toEqual(mockResume);
      expect(mockPrismaClient.resume.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true },
        data: { isDefault: false }
      });
      expect(mockPrismaClient.resume.update).toHaveBeenCalledWith({
        where: { id: mockResumeId },
        data: { isDefault: true }
      });
    });

    test('should get default resume', async () => {
      const mockResume = { id: mockResumeId, userId: mockUserId, ...mockResumeData };
      mockPrismaClient.resume.findFirst.mockResolvedValue(mockResume);

      const result = await ResumeService.getDefaultResume(mockUserId);

      expect(result).toEqual(mockResume);
      expect(mockPrismaClient.resume.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true }
      });
    });
  });

  describe('Content Generation', () => {
    const mockUserId = 'user-123';

    test('should generate resume content from user data and projects', async () => {
      const mockUser = {
        id: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        targetJobTitle: 'Software Engineer'
      };

      const mockProjects = [
        {
          id: 'project-1',
          title: 'Test Project',
          description: 'A test project',
          techStack: 'React, Node.js',
          status: 'COMPLETED'
        }
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.project.findMany.mockResolvedValue(mockProjects);

      const result = await ResumeService.generateResumeContent(mockUserId);

      expect(result).toBeDefined();
      expect(result.personalInfo).toBeDefined();
      expect(result.personalInfo.firstName).toBe('John');
      expect(result.personalInfo.lastName).toBe('Doe');
      expect(result.projects).toBeDefined();
      expect(result.projects.length).toBe(1);
    });

    test('should throw error for non-existent user', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(ResumeService.generateResumeContent(mockUserId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('Export Functionality', () => {
    const mockUserId = 'user-123';
    const mockResumeId = 'resume-123';
    const mockResume = {
      id: mockResumeId,
      userId: mockUserId,
      versionName: 'Test Resume',
      templateId: 'professional-standard',
      content: JSON.stringify({
        personalInfo: { firstName: 'John', lastName: 'Doe' },
        summary: 'Test summary',
        experience: [],
        projects: [],
        skills: { technical: [], soft: [] },
        education: []
      })
    };

    test('should export resume as text', async () => {
      mockPrismaClient.resume.findFirst.mockResolvedValue(mockResume);

      const result = await ResumeService.exportResume(mockResumeId, mockUserId, 'txt');

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toContain('John Doe');
    });

    test('should export resume as DOCX', async () => {
      mockPrismaClient.resume.findFirst.mockResolvedValue(mockResume);

      const result = await ResumeService.exportResume(mockResumeId, mockUserId, 'docx');

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should export resume as PDF (HTML)', async () => {
      mockPrismaClient.resume.findFirst.mockResolvedValue(mockResume);

      const result = await ResumeService.exportResume(mockResumeId, mockUserId, 'pdf');

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toContain('<html>');
    });

    test('should throw error for unsupported format', async () => {
      await expect(ResumeService.exportResume(mockResumeId, mockUserId, 'invalid' as any))
        .rejects
        .toThrow('Unsupported export format');
    });

    test('should throw error for non-existent resume', async () => {
      mockPrismaClient.resume.findFirst.mockResolvedValue(null);

      await expect(ResumeService.exportResume(mockResumeId, mockUserId, 'txt'))
        .rejects
        .toThrow('Resume not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockPrismaClient.resume.findMany.mockRejectedValue(new Error('Database connection failed'));

      await expect(ResumeService.getUserResumes('user-123'))
        .rejects
        .toThrow('Database connection failed');
    });

    test('should handle invalid template ID', async () => {
      const template = await ResumeService.getTemplateById('invalid-template-id');
      expect(template).toBeNull();
    });
  });
}); 
import { PrismaClient } from '@prisma/client';

// Mock Prisma before importing the service
jest.mock('@prisma/client');

const mockPrisma = {
  interview: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  jobApplication: {
    findUnique: jest.fn(),
  },
} as any;

(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma);

// Import the service after mocking Prisma
import interviewService from '../services/interviewService';

describe('InterviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInterview', () => {
    it('should create a new interview successfully', async () => {
      const mockApplication = {
        id: 'app-1',
        userId: 'user-1',
        user: { id: 'user-1' }
      };

      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well',
        questionsAsked: '',
        outcome: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.jobApplication.findUnique.mockResolvedValue(mockApplication);
      mockPrisma.interview.create.mockResolvedValue(mockInterview);

      const interviewData = {
        applicationId: 'app-1',
        interviewType: 'PHONE' as const,
        scheduledDate: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well'
      };

      const result = await interviewService.createInterview(interviewData);

      expect(mockPrisma.jobApplication.findUnique).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        include: { user: true }
      });
      expect(mockPrisma.interview.create).toHaveBeenCalledWith({
        data: {
          applicationId: 'app-1',
          interviewType: 'PHONE',
          scheduledDate: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
          interviewerName: 'John Doe',
          preparationNotes: 'Prepare well',
          questionsAsked: '',
          outcome: 'PENDING'
        }
      });
      expect(result).toEqual(mockInterview);
    });

    it('should throw error if application not found', async () => {
      mockPrisma.jobApplication.findUnique.mockResolvedValue(null);

      const interviewData = {
        applicationId: 'invalid-app',
        interviewType: 'PHONE' as const,
        scheduledDate: new Date(),
        duration: 60
      };

      await expect(interviewService.createInterview(interviewData))
        .rejects.toThrow('Job application not found');
    });
  });

  describe('getUserInterviews', () => {
    it('should fetch user interviews with filters', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          applicationId: 'app-1',
          interviewType: 'PHONE',
          scheduledDate: new Date(),
          duration: 60,
          outcome: 'PENDING',
          application: {
            id: 'app-1',
            companyName: 'Test Company',
            jobTitle: 'Developer',
            user: { id: 'user-1' },
            resume: { id: 'resume-1' }
          }
        }
      ];

      mockPrisma.interview.findMany.mockResolvedValue(mockInterviews);

      const filters = {
        interviewType: 'PHONE',
        outcome: 'PENDING'
      };

      const result = await interviewService.getUserInterviews('user-1', filters);

      expect(mockPrisma.interview.findMany).toHaveBeenCalledWith({
        where: {
          application: { userId: 'user-1' },
          interviewType: 'PHONE',
          outcome: 'PENDING'
        },
        include: {
          application: {
            include: {
              user: true,
              resume: true
            }
          }
        },
        orderBy: { scheduledDate: 'desc' }
      });
      expect(result).toEqual(mockInterviews);
    });

    it('should fetch user interviews without filters', async () => {
      const mockInterviews: any[] = [];
      mockPrisma.interview.findMany.mockResolvedValue(mockInterviews);

      const result = await interviewService.getUserInterviews('user-1');

      expect(mockPrisma.interview.findMany).toHaveBeenCalledWith({
        where: { application: { userId: 'user-1' } },
        include: {
          application: {
            include: {
              user: true,
              resume: true
            }
          }
        },
        orderBy: { scheduledDate: 'desc' }
      });
      expect(result).toEqual(mockInterviews);
    });
  });

  describe('getInterviewById', () => {
    it('should fetch interview by ID for user', async () => {
      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        application: {
          id: 'app-1',
          userId: 'user-1',
          user: { id: 'user-1' },
          resume: { id: 'resume-1' }
        }
      };

      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);

      const result = await interviewService.getInterviewById('interview-1', 'user-1');

      expect(mockPrisma.interview.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'interview-1',
          application: { userId: 'user-1' }
        },
        include: {
          application: {
            include: {
              user: true,
              resume: true
            }
          }
        }
      });
      expect(result).toEqual(mockInterview);
    });

    it('should return null if interview not found', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue(null);

      const result = await interviewService.getInterviewById('invalid-id', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('updateInterview', () => {
    it('should update interview successfully', async () => {
      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        application: { userId: 'user-1' }
      };

      const updatedInterview = {
        ...mockInterview,
        interviewType: 'VIDEO',
        duration: 90
      };

      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);
      mockPrisma.interview.update.mockResolvedValue(updatedInterview);

      const updateData = {
        interviewType: 'VIDEO' as const,
        duration: 90
      };

      const result = await interviewService.updateInterview('interview-1', 'user-1', updateData);

      expect(mockPrisma.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-1' },
        data: updateData
      });
      expect(result).toEqual(updatedInterview);
    });

    it('should throw error if interview not found', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue(null);

      await expect(interviewService.updateInterview('invalid-id', 'user-1', {}))
        .rejects.toThrow('Interview not found or access denied');
    });
  });

  describe('deleteInterview', () => {
    it('should delete interview successfully', async () => {
      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        application: { userId: 'user-1' }
      };

      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);
      mockPrisma.interview.delete.mockResolvedValue(mockInterview);

      await interviewService.deleteInterview('interview-1', 'user-1');

      expect(mockPrisma.interview.delete).toHaveBeenCalledWith({
        where: { id: 'interview-1' }
      });
    });

    it('should throw error if interview not found', async () => {
      mockPrisma.interview.findFirst.mockResolvedValue(null);

      await expect(interviewService.deleteInterview('invalid-id', 'user-1'))
        .rejects.toThrow('Interview not found or access denied');
    });
  });

  describe('addInterviewQuestions', () => {
    it('should add questions to interview', async () => {
      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        application: { userId: 'user-1' }
      };

      const updatedInterview = {
        ...mockInterview,
        questionsAsked: 'What is your experience with React?'
      };

      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);
      mockPrisma.interview.update.mockResolvedValue(updatedInterview);

      const result = await interviewService.addInterviewQuestions('interview-1', 'user-1', 'What is your experience with React?');

      expect(mockPrisma.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-1' },
        data: { questionsAsked: 'What is your experience with React?' }
      });
      expect(result).toEqual(updatedInterview);
    });
  });

  describe('addInterviewFeedback', () => {
    it('should add feedback to interview', async () => {
      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        application: { userId: 'user-1' }
      };

      const updatedInterview = {
        ...mockInterview,
        feedback: 'Great performance, strong technical skills'
      };

      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);
      mockPrisma.interview.update.mockResolvedValue(updatedInterview);

      const result = await interviewService.addInterviewFeedback('interview-1', 'user-1', 'Great performance, strong technical skills');

      expect(mockPrisma.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-1' },
        data: { feedback: 'Great performance, strong technical skills' }
      });
      expect(result).toEqual(updatedInterview);
    });
  });

  describe('updateInterviewOutcome', () => {
    it('should update interview outcome', async () => {
      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        application: { userId: 'user-1' }
      };

      const updatedInterview = {
        ...mockInterview,
        outcome: 'PASSED'
      };

      mockPrisma.interview.findFirst.mockResolvedValue(mockInterview);
      mockPrisma.interview.update.mockResolvedValue(updatedInterview);

      const result = await interviewService.updateInterviewOutcome('interview-1', 'user-1', 'PASSED');

      expect(mockPrisma.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-1' },
        data: { outcome: 'PASSED' }
      });
      expect(result).toEqual(updatedInterview);
    });
  });

  describe('getUpcomingInterviews', () => {
    it('should fetch upcoming interviews', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          applicationId: 'app-1',
          scheduledDate: new Date('2024-12-31T10:00:00Z'),
          outcome: 'PENDING',
          application: {
            id: 'app-1',
            companyName: 'Future Company',
            jobTitle: 'Developer',
            user: { id: 'user-1' },
            resume: { id: 'resume-1' }
          }
        }
      ];

      mockPrisma.interview.findMany.mockResolvedValue(mockInterviews);

      const result = await interviewService.getUpcomingInterviews('user-1');

      expect(mockPrisma.interview.findMany).toHaveBeenCalledWith({
        where: {
          application: { userId: 'user-1' },
          scheduledDate: { gte: expect.any(Date) },
          outcome: 'PENDING'
        },
        include: {
          application: {
            include: {
              user: true,
              resume: true
            }
          }
        },
        orderBy: { scheduledDate: 'asc' }
      });
      expect(result).toEqual(mockInterviews);
    });
  });

  describe('getInterviewStats', () => {
    it('should calculate interview statistics', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          scheduledDate: new Date('2024-01-01T10:00:00Z'),
          outcome: 'PASSED',
          duration: 60,
          application: { id: 'app-1' }
        },
        {
          id: 'interview-2',
          scheduledDate: new Date('2025-12-31T10:00:00Z'),
          outcome: 'PENDING',
          duration: 45,
          application: { id: 'app-2' }
        },
        {
          id: 'interview-3',
          scheduledDate: new Date('2024-01-02T10:00:00Z'),
          outcome: 'FAILED',
          duration: 90,
          application: { id: 'app-3' }
        }
      ];

      mockPrisma.interview.findMany.mockResolvedValue(mockInterviews);

      const result = await interviewService.getInterviewStats('user-1');

      expect(result).toEqual({
        total: 3,
        upcoming: 1,
        completed: 2,
        passed: 1,
        failed: 1,
        cancelled: 0,
        averageDuration: 75
      });
    });
  });

  describe('getPreparationMaterials', () => {
    it('should return preparation materials for company', async () => {
      const result = await interviewService.getPreparationMaterials('Google');

      expect(result).toHaveProperty('companyInfo');
      expect(result).toHaveProperty('commonQuestions');
      expect(result).toHaveProperty('technicalTopics');
      expect(result).toHaveProperty('behavioralQuestions');
      expect(result.companyInfo).toContain('Google');
      expect(Array.isArray(result.commonQuestions)).toBe(true);
      expect(Array.isArray(result.technicalTopics)).toBe(true);
      expect(Array.isArray(result.behavioralQuestions)).toBe(true);
    });
  });
}); 
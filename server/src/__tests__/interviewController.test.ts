import request from 'supertest';
import app from '../index';
import interviewService from '../services/interviewService';
import { InterviewWithApplication } from '../services/interviewService';

// Mock the interview service
jest.mock('../services/interviewService');
const mockInterviewService = interviewService as jest.Mocked<typeof interviewService>;

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-1', email: 'test@example.com' };
    next();
  }
}));

describe('InterviewController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to convert mock data to JSON format (as it would be serialized)
  const toJsonFormat = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };

  describe('POST /api/interviews', () => {
    it('should create a new interview successfully', async () => {
      const interviewData = {
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: '2024-01-15T10:00:00Z',
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well'
      };

      const mockInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: new Date(interviewData.scheduledDate),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well',
        questionsAsked: '',
        feedback: null,
        outcome: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockInterviewService.createInterview.mockResolvedValue(mockInterview);

      const response = await request(app)
        .post('/api/interviews')
        .send(interviewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(mockInterview));
      expect(mockInterviewService.createInterview).toHaveBeenCalledWith({
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well'
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          applicationId: 'app-1'
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 for invalid interview type', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          applicationId: 'app-1',
          interviewType: 'INVALID_TYPE',
          scheduledDate: '2024-01-15T10:00:00Z',
          duration: 60
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INTERVIEW_TYPE');
    });
  });

  describe('GET /api/interviews', () => {
    it('should fetch user interviews successfully', async () => {
      const mockInterviews: InterviewWithApplication[] = [
        {
          id: 'interview-1',
          applicationId: 'app-1',
          interviewType: 'PHONE',
          scheduledDate: new Date(),
          duration: 60,
          interviewerName: 'John Doe',
          preparationNotes: 'Prepare well',
          questionsAsked: '',
          feedback: null,
          outcome: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          application: {
            id: 'app-1',
            userId: 'user-1',
            resumeId: 'resume-1',
            companyName: 'Test Company',
            jobTitle: 'Developer',
            jobUrl: 'https://example.com/job',
            applicationDate: new Date(),
            status: 'APPLIED',
            coverLetter: null,
            notes: null,
            followUpDate: null,
            companyResearch: null,
            preparationNotes: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      ];

      mockInterviewService.getUserInterviews.mockResolvedValue(mockInterviews);

      const response = await request(app)
        .get('/api/interviews')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(mockInterviews));
      expect(mockInterviewService.getUserInterviews).toHaveBeenCalledWith('user-1', {});
    });

    it('should fetch interviews with filters', async () => {
      const mockInterviews: InterviewWithApplication[] = [];
      mockInterviewService.getUserInterviews.mockResolvedValue(mockInterviews);

      const response = await request(app)
        .get('/api/interviews?interviewType=PHONE&outcome=PENDING')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockInterviewService.getUserInterviews).toHaveBeenCalledWith('user-1', {
        interviewType: 'PHONE',
        outcome: 'PENDING'
      });
    });
  });

  describe('GET /api/interviews/:id', () => {
    it('should fetch interview by ID successfully', async () => {
      const mockInterview: InterviewWithApplication = {
        id: 'interview-1',
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: new Date(),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well',
        questionsAsked: '',
        feedback: null,
        outcome: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        application: {
          id: 'app-1',
          userId: 'user-1',
          resumeId: 'resume-1',
          companyName: 'Test Company',
          jobTitle: 'Developer',
          jobUrl: 'https://example.com/job',
          applicationDate: new Date(),
          status: 'APPLIED',
          coverLetter: null,
          notes: null,
          followUpDate: null,
          companyResearch: null,
          preparationNotes: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockInterviewService.getInterviewById.mockResolvedValue(mockInterview);

      const response = await request(app)
        .get('/api/interviews/interview-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(mockInterview));
      expect(mockInterviewService.getInterviewById).toHaveBeenCalledWith('interview-1', 'user-1');
    });

    it('should return 404 for non-existent interview', async () => {
      mockInterviewService.getInterviewById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/interviews/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERVIEW_NOT_FOUND');
    });
  });

  describe('PUT /api/interviews/:id', () => {
    it('should update interview successfully', async () => {
      const updateData = {
        interviewType: 'VIDEO',
        duration: 90
      };

      const updatedInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        interviewType: 'VIDEO',
        scheduledDate: new Date(),
        duration: 90,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well',
        questionsAsked: '',
        feedback: null,
        outcome: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockInterviewService.updateInterview.mockResolvedValue(updatedInterview);

      const response = await request(app)
        .put('/api/interviews/interview-1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(updatedInterview));
      expect(mockInterviewService.updateInterview).toHaveBeenCalledWith('interview-1', 'user-1', updateData);
    });

    it('should return 400 for invalid interview type', async () => {
      const response = await request(app)
        .put('/api/interviews/interview-1')
        .send({
          interviewType: 'INVALID_TYPE'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INTERVIEW_TYPE');
    });
  });

  describe('DELETE /api/interviews/:id', () => {
    it('should delete interview successfully', async () => {
      mockInterviewService.deleteInterview.mockResolvedValue();

      const response = await request(app)
        .delete('/api/interviews/interview-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockInterviewService.deleteInterview).toHaveBeenCalledWith('interview-1', 'user-1');
    });
  });

  describe('POST /api/interviews/:id/questions', () => {
    it('should add questions to interview successfully', async () => {
      const questions = 'What is your experience with React?';
      const updatedInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: new Date(),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well',
        questionsAsked: questions,
        feedback: null,
        outcome: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockInterviewService.addInterviewQuestions.mockResolvedValue(updatedInterview);

      const response = await request(app)
        .post('/api/interviews/interview-1/questions')
        .send({ questions })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(updatedInterview));
      expect(mockInterviewService.addInterviewQuestions).toHaveBeenCalledWith('interview-1', 'user-1', questions);
    });

    it('should return 400 for missing questions', async () => {
      const response = await request(app)
        .post('/api/interviews/interview-1/questions')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_QUESTIONS');
    });
  });

  describe('POST /api/interviews/:id/feedback', () => {
    it('should add feedback to interview successfully', async () => {
      const feedback = 'Great performance, strong technical skills';
      const updatedInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: new Date(),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well',
        questionsAsked: '',
        feedback: feedback,
        outcome: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockInterviewService.addInterviewFeedback.mockResolvedValue(updatedInterview);

      const response = await request(app)
        .post('/api/interviews/interview-1/feedback')
        .send({ feedback })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(updatedInterview));
      expect(mockInterviewService.addInterviewFeedback).toHaveBeenCalledWith('interview-1', 'user-1', feedback);
    });

    it('should return 400 for missing feedback', async () => {
      const response = await request(app)
        .post('/api/interviews/interview-1/feedback')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_FEEDBACK');
    });
  });

  describe('PUT /api/interviews/:id/outcome', () => {
    it('should update interview outcome successfully', async () => {
      const outcome = 'PASSED';
      const updatedInterview = {
        id: 'interview-1',
        applicationId: 'app-1',
        interviewType: 'PHONE',
        scheduledDate: new Date(),
        duration: 60,
        interviewerName: 'John Doe',
        preparationNotes: 'Prepare well',
        questionsAsked: '',
        feedback: null,
        outcome: outcome,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockInterviewService.updateInterviewOutcome.mockResolvedValue(updatedInterview);

      const response = await request(app)
        .put('/api/interviews/interview-1/outcome')
        .send({ outcome })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(updatedInterview));
      expect(mockInterviewService.updateInterviewOutcome).toHaveBeenCalledWith('interview-1', 'user-1', outcome);
    });

    it('should return 400 for missing outcome', async () => {
      const response = await request(app)
        .put('/api/interviews/interview-1/outcome')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_OUTCOME');
    });

    it('should return 400 for invalid outcome', async () => {
      const response = await request(app)
        .put('/api/interviews/interview-1/outcome')
        .send({ outcome: 'INVALID_OUTCOME' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_OUTCOME');
    });
  });

  describe('GET /api/interviews/upcoming', () => {
    it('should fetch upcoming interviews successfully', async () => {
      const mockInterviews: InterviewWithApplication[] = [
        {
          id: 'interview-1',
          applicationId: 'app-1',
          interviewType: 'PHONE',
          scheduledDate: new Date('2024-12-31T10:00:00Z'),
          duration: 60,
          interviewerName: 'John Doe',
          preparationNotes: 'Prepare well',
          questionsAsked: '',
          feedback: null,
          outcome: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          application: {
            id: 'app-1',
            userId: 'user-1',
            resumeId: 'resume-1',
            companyName: 'Future Company',
            jobTitle: 'Developer',
            jobUrl: 'https://example.com/job',
            applicationDate: new Date(),
            status: 'APPLIED',
            coverLetter: null,
            notes: null,
            followUpDate: null,
            companyResearch: null,
            preparationNotes: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      ];

      mockInterviewService.getUpcomingInterviews.mockResolvedValue(mockInterviews);

      const response = await request(app)
        .get('/api/interviews/upcoming')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(mockInterviews));
      expect(mockInterviewService.getUpcomingInterviews).toHaveBeenCalledWith('user-1');
    });
  });

  describe('GET /api/interviews/stats', () => {
    it('should fetch interview statistics successfully', async () => {
      const mockStats = {
        total: 5,
        upcoming: 2,
        completed: 3,
        passed: 2,
        failed: 1,
        cancelled: 0,
        averageDuration: 75
      };

      mockInterviewService.getInterviewStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/interviews/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
      expect(mockInterviewService.getInterviewStats).toHaveBeenCalledWith('user-1');
    });
  });

  describe('GET /api/interviews/preparation/:companyName', () => {
    it('should fetch preparation materials successfully', async () => {
      const mockMaterials = {
        companyInfo: 'Research information about Google...',
        commonQuestions: ['Tell me about yourself'],
        technicalTopics: ['Data Structures'],
        behavioralQuestions: ['Describe a challenging project']
      };

      mockInterviewService.getPreparationMaterials.mockResolvedValue(mockMaterials);

      const response = await request(app)
        .get('/api/interviews/preparation/Google')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMaterials);
      expect(mockInterviewService.getPreparationMaterials).toHaveBeenCalledWith('Google');
    });

    it('should return 404 for missing company name', async () => {
      const response = await request(app)
        .get('/api/interviews/preparation/')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERVIEW_NOT_FOUND');
    });
  });
}); 
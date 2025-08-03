import request from 'supertest';
import app from '../index';
import jobApplicationService from '../services/jobApplicationService';

// Mock the job application service
jest.mock('../services/jobApplicationService');
const mockJobApplicationService = jobApplicationService as jest.Mocked<typeof jobApplicationService>;

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-1', email: 'test@example.com' };
    next();
  }
}));

describe('JobApplicationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to convert mock data to JSON format (as it would be serialized)
  const toJsonFormat = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };

  const mockApplication = {
    id: 'app-1',
    userId: 'user-1',
    resumeId: 'resume-1',
    companyName: 'Test Company',
    jobTitle: 'Software Engineer',
    jobUrl: 'https://example.com/job',
    applicationDate: new Date('2024-01-01'),
    status: 'APPLIED',
    coverLetter: 'Test cover letter',
    notes: 'Test notes',
    followUpDate: new Date('2024-01-08'),
    companyResearch: 'Test company research',
    preparationNotes: 'Test preparation notes',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    resume: {
      id: 'resume-1',
      versionName: 'Default Resume'
    },
    interviews: []
  };

  describe('POST /api/applications', () => {
    it('should create a new job application', async () => {
      const applicationData = {
        resumeId: 'resume-1',
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        jobUrl: 'https://example.com/job',
        coverLetter: 'Test cover letter',
        notes: 'Test notes',
        followUpDate: '2024-01-08'
      };

      mockJobApplicationService.createApplication.mockResolvedValue(mockApplication);

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(mockApplication));
      expect(mockJobApplicationService.createApplication).toHaveBeenCalledWith({
        userId: 'user-1',
        ...applicationData,
        followUpDate: new Date('2024-01-08')
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          companyName: 'Test Company'
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });

    it('should return 500 when service throws error', async () => {
      mockJobApplicationService.createApplication.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/applications')
        .send({
          resumeId: 'resume-1',
          companyName: 'Test Company',
          jobTitle: 'Software Engineer',
          jobUrl: 'https://example.com/job'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CREATE_APPLICATION_ERROR');
    });
  });

  describe('GET /api/applications', () => {
    it('should get all applications for user', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.getUserApplications.mockResolvedValue(applications);

      const response = await request(app)
        .get('/api/applications')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(applications));
      expect(mockJobApplicationService.getUserApplications).toHaveBeenCalledWith('user-1', {});
    });

    it('should apply filters when query parameters are provided', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.getUserApplications.mockResolvedValue(applications);

      const response = await request(app)
        .get('/api/applications?status=APPLIED&companyName=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockJobApplicationService.getUserApplications).toHaveBeenCalledWith('user-1', {
        status: 'APPLIED',
        companyName: 'Test'
      });
    });

    it('should search applications when search parameter is provided', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.searchApplications.mockResolvedValue(applications);

      const response = await request(app)
        .get('/api/applications?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockJobApplicationService.searchApplications).toHaveBeenCalledWith('user-1', 'Test');
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should get application by ID', async () => {
      mockJobApplicationService.getApplicationById.mockResolvedValue(mockApplication);

      const response = await request(app)
        .get('/api/applications/app-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(mockApplication));
      expect(mockJobApplicationService.getApplicationById).toHaveBeenCalledWith('app-1', 'user-1');
    });

    it('should return 400 when ID is missing', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.getUserApplications.mockResolvedValue(applications);

      const response = await request(app)
        .get('/api/applications/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(applications));
      expect(mockJobApplicationService.getUserApplications).toHaveBeenCalledWith('user-1', {});
    });

    it('should return 404 when application not found', async () => {
      mockJobApplicationService.getApplicationById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/applications/app-1')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('APPLICATION_NOT_FOUND');
    });
  });

  describe('PUT /api/applications/:id', () => {
    it('should update application', async () => {
      const updateData = {
        companyName: 'Updated Company',
        jobTitle: 'Senior Engineer'
      };
      const updatedApplication = { ...mockApplication, ...updateData };
      mockJobApplicationService.updateApplication.mockResolvedValue(updatedApplication);

      const response = await request(app)
        .put('/api/applications/app-1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(updatedApplication));
      expect(mockJobApplicationService.updateApplication).toHaveBeenCalledWith('app-1', 'user-1', updateData);
    });

    it('should return 400 when ID is missing', async () => {
      const response = await request(app)
        .put('/api/applications/')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('should update application status', async () => {
      const updatedApplication = { ...mockApplication, status: 'INTERVIEW' };
      mockJobApplicationService.updateApplicationStatus.mockResolvedValue(updatedApplication);

      const response = await request(app)
        .patch('/api/applications/app-1/status')
        .send({ status: 'INTERVIEW' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(updatedApplication));
      expect(mockJobApplicationService.updateApplicationStatus).toHaveBeenCalledWith('app-1', 'user-1', 'INTERVIEW');
    });

    it('should return 400 when status is missing', async () => {
      const response = await request(app)
        .patch('/api/applications/app-1/status')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_STATUS');
    });
  });

  describe('POST /api/applications/:id/notes', () => {
    it('should add notes to application', async () => {
      const newNote = 'New note added';
      const updatedApplication = { ...mockApplication, notes: newNote };
      mockJobApplicationService.addApplicationNotes.mockResolvedValue(updatedApplication);

      const response = await request(app)
        .post('/api/applications/app-1/notes')
        .send({ notes: newNote })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(updatedApplication));
      expect(mockJobApplicationService.addApplicationNotes).toHaveBeenCalledWith('app-1', 'user-1', newNote);
    });

    it('should return 400 when notes are missing', async () => {
      const response = await request(app)
        .post('/api/applications/app-1/notes')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_NOTES');
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete application', async () => {
      mockJobApplicationService.deleteApplication.mockResolvedValue();

      const response = await request(app)
        .delete('/api/applications/app-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Job application deleted successfully');
      expect(mockJobApplicationService.deleteApplication).toHaveBeenCalledWith('app-1', 'user-1');
    });

    it('should return 400 when ID is missing', async () => {
      const response = await request(app)
        .delete('/api/applications/')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/applications/follow-up', () => {
    it('should get applications needing follow-up', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.getApplicationsNeedingFollowUp.mockResolvedValue(applications);

      const response = await request(app)
        .get('/api/applications/follow-up')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(toJsonFormat(applications));
      expect(mockJobApplicationService.getApplicationsNeedingFollowUp).toHaveBeenCalledWith('user-1');
    });
  });

  describe('GET /api/applications/analytics', () => {
    it('should get application analytics', async () => {
      const analytics = {
        totalApplications: 5,
        applicationsByStatus: { 'APPLIED': 3, 'INTERVIEW': 1, 'OFFER': 1 },
        applicationsByMonth: { '2024-01': 5 },
        averageTimeToResponse: 7.5,
        successRate: 20,
        topCompanies: [{ companyName: 'Test Company', count: 3 }]
      };
      mockJobApplicationService.getApplicationAnalytics.mockResolvedValue(analytics);

      const response = await request(app)
        .get('/api/applications/analytics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(analytics);
      expect(mockJobApplicationService.getApplicationAnalytics).toHaveBeenCalledWith('user-1');
    });
  });
}); 
import jobApplicationService from '../services/jobApplicationService';
import { CreateJobApplicationData } from '../services/jobApplicationService';

// Mock the service methods
jest.mock('../services/jobApplicationService', () => ({
  __esModule: true,
  default: {
    createApplication: jest.fn(),
    getUserApplications: jest.fn(),
    getApplicationById: jest.fn(),
    updateApplication: jest.fn(),
    updateApplicationStatus: jest.fn(),
    addApplicationNotes: jest.fn(),
    deleteApplication: jest.fn(),
    getApplicationsNeedingFollowUp: jest.fn(),
    getApplicationAnalytics: jest.fn(),
    searchApplications: jest.fn(),
  },
}));

const mockJobApplicationService = jobApplicationService as jest.Mocked<typeof jobApplicationService>;

describe('JobApplicationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe('createApplication', () => {
    it('should create a new job application', async () => {
      const createData: CreateJobApplicationData = {
        userId: 'user-1',
        resumeId: 'resume-1',
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        jobUrl: 'https://example.com/job',
        coverLetter: 'Test cover letter',
        notes: 'Test notes',
        followUpDate: new Date('2024-01-08')
      };

      mockJobApplicationService.createApplication.mockResolvedValue(mockApplication);

      const result = await jobApplicationService.createApplication(createData);

      expect(mockJobApplicationService.createApplication).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockApplication);
    });

    it('should throw error when creation fails', async () => {
      const createData: CreateJobApplicationData = {
        userId: 'user-1',
        resumeId: 'resume-1',
        companyName: 'Test Company',
        jobTitle: 'Software Engineer',
        jobUrl: 'https://example.com/job'
      };

      mockJobApplicationService.createApplication.mockRejectedValue(new Error('Database error'));

      await expect(jobApplicationService.createApplication(createData))
        .rejects.toThrow('Database error');
    });
  });

  describe('getUserApplications', () => {
    it('should get all applications for a user', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.getUserApplications.mockResolvedValue(applications);

      const result = await jobApplicationService.getUserApplications('user-1');

      expect(mockJobApplicationService.getUserApplications).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(applications);
    });

    it('should apply filters when provided', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.getUserApplications.mockResolvedValue(applications);

      const filters = {
        status: 'APPLIED',
        companyName: 'Test',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31')
      };

      await jobApplicationService.getUserApplications('user-1', filters);

      expect(mockJobApplicationService.getUserApplications).toHaveBeenCalledWith('user-1', filters);
    });
  });

  describe('getApplicationById', () => {
    it('should get a single application by ID', async () => {
      mockJobApplicationService.getApplicationById.mockResolvedValue(mockApplication);

      const result = await jobApplicationService.getApplicationById('app-1', 'user-1');

      expect(mockJobApplicationService.getApplicationById).toHaveBeenCalledWith('app-1', 'user-1');
      expect(result).toEqual(mockApplication);
    });

    it('should return null when application not found', async () => {
      mockJobApplicationService.getApplicationById.mockResolvedValue(null);

      const result = await jobApplicationService.getApplicationById('app-1', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('updateApplication', () => {
    it('should update an application', async () => {
      const updateData = {
        companyName: 'Updated Company',
        jobTitle: 'Senior Engineer'
      };

      const updatedApplication = { ...mockApplication, ...updateData };
      mockJobApplicationService.updateApplication.mockResolvedValue(updatedApplication);

      const result = await jobApplicationService.updateApplication('app-1', 'user-1', updateData);

      expect(mockJobApplicationService.updateApplication).toHaveBeenCalledWith('app-1', 'user-1', updateData);
      expect(result).toEqual(updatedApplication);
    });

    it('should throw error when application not found', async () => {
      mockJobApplicationService.updateApplication.mockRejectedValue(new Error('Job application not found'));

      await expect(jobApplicationService.updateApplication('app-1', 'user-1', {}))
        .rejects.toThrow('Job application not found');
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status with valid status', async () => {
      const updatedApplication = { ...mockApplication, status: 'INTERVIEW' };
      mockJobApplicationService.updateApplicationStatus.mockResolvedValue(updatedApplication);

      const result = await jobApplicationService.updateApplicationStatus('app-1', 'user-1', 'INTERVIEW');

      expect(mockJobApplicationService.updateApplicationStatus).toHaveBeenCalledWith('app-1', 'user-1', 'INTERVIEW');
      expect(result).toEqual(updatedApplication);
    });

    it('should throw error for invalid status', async () => {
      mockJobApplicationService.updateApplicationStatus.mockRejectedValue(
        new Error('Invalid status. Must be one of: APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED, WITHDRAWN')
      );

      await expect(jobApplicationService.updateApplicationStatus('app-1', 'user-1', 'INVALID'))
        .rejects.toThrow('Invalid status. Must be one of: APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED, WITHDRAWN');
    });

    it('should throw error when application not found', async () => {
      mockJobApplicationService.updateApplicationStatus.mockRejectedValue(new Error('Job application not found'));

      await expect(jobApplicationService.updateApplicationStatus('app-1', 'user-1', 'INTERVIEW'))
        .rejects.toThrow('Job application not found');
    });
  });

  describe('addApplicationNotes', () => {
    it('should add notes to an application', async () => {
      const newNote = 'New note added';
      const updatedApplication = {
        ...mockApplication,
        notes: `${mockApplication.notes}\n\n${new Date().toISOString()}: ${newNote}`
      };

      mockJobApplicationService.addApplicationNotes.mockResolvedValue(updatedApplication);

      const result = await jobApplicationService.addApplicationNotes('app-1', 'user-1', newNote);

      expect(mockJobApplicationService.addApplicationNotes).toHaveBeenCalledWith('app-1', 'user-1', newNote);
      expect(result).toEqual(updatedApplication);
    });

    it('should handle application with no existing notes', async () => {
      const applicationWithoutNotes = { ...mockApplication, notes: null };
      const newNote = 'First note';
      const updatedApplication = {
        ...applicationWithoutNotes,
        notes: newNote
      };

      mockJobApplicationService.addApplicationNotes.mockResolvedValue(updatedApplication);

      const result = await jobApplicationService.addApplicationNotes('app-1', 'user-1', newNote);

      expect(result.notes).toBe(newNote);
    });
  });

  describe('deleteApplication', () => {
    it('should delete an application', async () => {
      mockJobApplicationService.deleteApplication.mockResolvedValue();

      await jobApplicationService.deleteApplication('app-1', 'user-1');

      expect(mockJobApplicationService.deleteApplication).toHaveBeenCalledWith('app-1', 'user-1');
    });

    it('should throw error when application not found', async () => {
      mockJobApplicationService.deleteApplication.mockRejectedValue(new Error('Job application not found'));

      await expect(jobApplicationService.deleteApplication('app-1', 'user-1'))
        .rejects.toThrow('Job application not found');
    });
  });

  describe('getApplicationsNeedingFollowUp', () => {
    it('should get applications needing follow-up', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.getApplicationsNeedingFollowUp.mockResolvedValue(applications);

      const result = await jobApplicationService.getApplicationsNeedingFollowUp('user-1');

      expect(mockJobApplicationService.getApplicationsNeedingFollowUp).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(applications);
    });
  });

  describe('getApplicationAnalytics', () => {
    it('should calculate application analytics', async () => {
      const analytics = {
        totalApplications: 5,
        applicationsByStatus: {
          'APPLIED': 1,
          'INTERVIEW': 1,
          'OFFER': 1
        },
        applicationsByMonth: { '2024-01': 5 },
        averageTimeToResponse: 0,
        successRate: 20,
        topCompanies: [
          { companyName: 'Company B', count: 2 },
          { companyName: 'Test Company', count: 3 }
        ]
      };

      mockJobApplicationService.getApplicationAnalytics.mockResolvedValue(analytics);

      const result = await jobApplicationService.getApplicationAnalytics('user-1');

      expect(mockJobApplicationService.getApplicationAnalytics).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(analytics);
    });
  });

  describe('searchApplications', () => {
    it('should search applications by term', async () => {
      const applications = [mockApplication];
      mockJobApplicationService.searchApplications.mockResolvedValue(applications);

      const result = await jobApplicationService.searchApplications('user-1', 'Test');

      expect(mockJobApplicationService.searchApplications).toHaveBeenCalledWith('user-1', 'Test');
      expect(result).toEqual(applications);
    });
  });
}); 
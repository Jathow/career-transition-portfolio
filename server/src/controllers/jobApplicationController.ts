import { Request, Response } from 'express';
import jobApplicationService, { 
  CreateJobApplicationData, 
  UpdateJobApplicationData,
  JobApplicationFilters 
} from '../services/jobApplicationService';
// import { validateRequest } from '../utils/validation';

export class JobApplicationController {
  /**
   * Create a new job application
   */
  async createApplication(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      // Validate required fields
      const requiredFields = ['resumeId', 'companyName', 'jobTitle', 'jobUrl'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: `Missing required fields: ${missingFields.join(', ')}`,
            timestamp: new Date().toISOString()
          }
        });
      }

      const applicationData: CreateJobApplicationData = {
        userId,
        resumeId: req.body.resumeId,
        companyName: req.body.companyName,
        jobTitle: req.body.jobTitle,
        jobUrl: req.body.jobUrl,
        coverLetter: req.body.coverLetter,
        notes: req.body.notes,
        followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : undefined,
        companyResearch: req.body.companyResearch,
        preparationNotes: req.body.preparationNotes
      };

      const application = await jobApplicationService.createApplication(applicationData);

      res.status(201).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error creating job application:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_APPLICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create job application',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get all applications for the authenticated user
   */
  async getUserApplications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { status, companyName, dateFrom, dateTo, search } = req.query;

      let applications;

      if (search && typeof search === 'string') {
        // Search applications
        applications = await jobApplicationService.searchApplications(userId, search);
      } else {
        // Get filtered applications
        const filters: JobApplicationFilters = {};
        
        if (status && typeof status === 'string') {
          filters.status = status;
        }
        
        if (companyName && typeof companyName === 'string') {
          filters.companyName = companyName;
        }
        
        if (dateFrom && typeof dateFrom === 'string') {
          filters.dateFrom = new Date(dateFrom);
        }
        
        if (dateTo && typeof dateTo === 'string') {
          filters.dateTo = new Date(dateTo);
        }

        applications = await jobApplicationService.getUserApplications(userId, filters);
      }

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching job applications:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_APPLICATIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch job applications',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get a single application by ID
   */
  async getApplicationById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_APPLICATION_ID',
            message: 'Application ID is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const application = await jobApplicationService.getApplicationById(id, userId);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'APPLICATION_NOT_FOUND',
            message: 'Job application not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error fetching job application:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_APPLICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch job application',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Update an application
   */
  async updateApplication(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_APPLICATION_ID',
            message: 'Application ID is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const updateData: UpdateJobApplicationData = {};
      
      if (req.body.companyName !== undefined) updateData.companyName = req.body.companyName;
      if (req.body.jobTitle !== undefined) updateData.jobTitle = req.body.jobTitle;
      if (req.body.jobUrl !== undefined) updateData.jobUrl = req.body.jobUrl;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.coverLetter !== undefined) updateData.coverLetter = req.body.coverLetter;
      if (req.body.notes !== undefined) updateData.notes = req.body.notes;
      if (req.body.followUpDate !== undefined) {
        updateData.followUpDate = req.body.followUpDate ? new Date(req.body.followUpDate) : undefined;
      }
      if (req.body.companyResearch !== undefined) updateData.companyResearch = req.body.companyResearch;
      if (req.body.preparationNotes !== undefined) updateData.preparationNotes = req.body.preparationNotes;

      const application = await jobApplicationService.updateApplication(id, userId, updateData);

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error updating job application:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_APPLICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update job application',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_APPLICATION_ID',
            message: 'Application ID is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_STATUS',
            message: 'Status is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const application = await jobApplicationService.updateApplicationStatus(id, userId, status);

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_STATUS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update application status',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Add notes to an application
   */
  async addApplicationNotes(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { notes } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_APPLICATION_ID',
            message: 'Application ID is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      if (!notes) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_NOTES',
            message: 'Notes are required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const application = await jobApplicationService.addApplicationNotes(id, userId, notes);

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error adding application notes:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ADD_NOTES_ERROR',
          message: error instanceof Error ? error.message : 'Failed to add application notes',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Delete an application
   */
  async deleteApplication(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_APPLICATION_ID',
            message: 'Application ID is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      await jobApplicationService.deleteApplication(id, userId);

      res.status(200).json({
        success: true,
        message: 'Job application deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job application:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_APPLICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete job application',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get applications that need follow-up
   */
  async getApplicationsNeedingFollowUp(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const applications = await jobApplicationService.getApplicationsNeedingFollowUp(userId);

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching applications needing follow-up:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FOLLOW_UP_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch applications needing follow-up',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get application analytics
   */
  async getApplicationAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const analytics = await jobApplicationService.getApplicationAnalytics(userId);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching application analytics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ANALYTICS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch application analytics',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

export default new JobApplicationController(); 
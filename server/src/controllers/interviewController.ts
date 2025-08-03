import { Request, Response } from 'express';
import interviewService, { 
  CreateInterviewData, 
  UpdateInterviewData,
  InterviewFilters 
} from '../services/interviewService';

export class InterviewController {
  /**
   * Create a new interview
   */
  async createInterview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      // Validate required fields
      const requiredFields = ['applicationId', 'interviewType', 'scheduledDate', 'duration'];
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

      // Validate interview type
      const validInterviewTypes = ['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL'];
      if (!validInterviewTypes.includes(req.body.interviewType)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INTERVIEW_TYPE',
            message: `Invalid interview type. Must be one of: ${validInterviewTypes.join(', ')}`,
            timestamp: new Date().toISOString()
          }
        });
      }

      const interviewData: CreateInterviewData = {
        applicationId: req.body.applicationId,
        interviewType: req.body.interviewType,
        scheduledDate: new Date(req.body.scheduledDate),
        duration: parseInt(req.body.duration),
        interviewerName: req.body.interviewerName,
        preparationNotes: req.body.preparationNotes
      };

      const interview = await interviewService.createInterview(interviewData);

      res.status(201).json({
        success: true,
        data: interview
      });
    } catch (error) {
      console.error('Error creating interview:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_INTERVIEW_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create interview',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get all interviews for the authenticated user
   */
  async getUserInterviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      // Parse query parameters for filtering
      const filters: InterviewFilters = {};
      
      if (req.query.applicationId) {
        filters.applicationId = req.query.applicationId as string;
      }
      if (req.query.interviewType) {
        filters.interviewType = req.query.interviewType as string;
      }
      if (req.query.outcome) {
        filters.outcome = req.query.outcome as string;
      }
      if (req.query.scheduledDateFrom) {
        filters.scheduledDateFrom = new Date(req.query.scheduledDateFrom as string);
      }
      if (req.query.scheduledDateTo) {
        filters.scheduledDateTo = new Date(req.query.scheduledDateTo as string);
      }

      const interviews = await interviewService.getUserInterviews(userId, filters);

      res.json({
        success: true,
        data: interviews
      });
    } catch (error) {
      console.error('Error fetching user interviews:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_INTERVIEWS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch interviews',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get a specific interview by ID
   */
  async getInterviewById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const interview = await interviewService.getInterviewById(id, userId);

      if (!interview) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'INTERVIEW_NOT_FOUND',
            message: 'Interview not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.json({
        success: true,
        data: interview
      });
    } catch (error) {
      console.error('Error fetching interview:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_INTERVIEW_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch interview',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Update an interview
   */
  async updateInterview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const updateData: UpdateInterviewData = {};
      
      if (req.body.interviewType) {
        const validInterviewTypes = ['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL'];
        if (!validInterviewTypes.includes(req.body.interviewType)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_INTERVIEW_TYPE',
              message: `Invalid interview type. Must be one of: ${validInterviewTypes.join(', ')}`,
              timestamp: new Date().toISOString()
            }
          });
        }
        updateData.interviewType = req.body.interviewType;
      }
      
      if (req.body.scheduledDate) {
        updateData.scheduledDate = new Date(req.body.scheduledDate);
      }
      if (req.body.duration) {
        updateData.duration = parseInt(req.body.duration);
      }
      if (req.body.interviewerName !== undefined) {
        updateData.interviewerName = req.body.interviewerName;
      }
      if (req.body.preparationNotes !== undefined) {
        updateData.preparationNotes = req.body.preparationNotes;
      }
      if (req.body.questionsAsked !== undefined) {
        updateData.questionsAsked = req.body.questionsAsked;
      }
      if (req.body.feedback !== undefined) {
        updateData.feedback = req.body.feedback;
      }
      if (req.body.outcome) {
        const validOutcomes = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED'];
        if (!validOutcomes.includes(req.body.outcome)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_OUTCOME',
              message: `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}`,
              timestamp: new Date().toISOString()
            }
          });
        }
        updateData.outcome = req.body.outcome;
      }

      const updatedInterview = await interviewService.updateInterview(id, userId, updateData);

      res.json({
        success: true,
        data: updatedInterview
      });
    } catch (error) {
      console.error('Error updating interview:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_INTERVIEW_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update interview',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Delete an interview
   */
  async deleteInterview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      await interviewService.deleteInterview(id, userId);

      res.json({
        success: true,
        message: 'Interview deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting interview:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_INTERVIEW_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete interview',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Add questions asked during interview
   */
  async addInterviewQuestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { questions } = req.body;

      if (!questions) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUESTIONS',
            message: 'Questions field is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const updatedInterview = await interviewService.addInterviewQuestions(id, userId, questions);

      res.json({
        success: true,
        data: updatedInterview
      });
    } catch (error) {
      console.error('Error adding interview questions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ADD_QUESTIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to add interview questions',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Add interview feedback
   */
  async addInterviewFeedback(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { feedback } = req.body;

      if (!feedback) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FEEDBACK',
            message: 'Feedback field is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const updatedInterview = await interviewService.addInterviewFeedback(id, userId, feedback);

      res.json({
        success: true,
        data: updatedInterview
      });
    } catch (error) {
      console.error('Error adding interview feedback:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ADD_FEEDBACK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to add interview feedback',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Update interview outcome
   */
  async updateInterviewOutcome(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { outcome } = req.body;

      if (!outcome) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_OUTCOME',
            message: 'Outcome field is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const validOutcomes = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED'];
      if (!validOutcomes.includes(outcome)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_OUTCOME',
            message: `Invalid outcome. Must be one of: ${validOutcomes.join(', ')}`,
            timestamp: new Date().toISOString()
          }
        });
      }

      const updatedInterview = await interviewService.updateInterviewOutcome(id, userId, outcome);

      res.json({
        success: true,
        data: updatedInterview
      });
    } catch (error) {
      console.error('Error updating interview outcome:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_OUTCOME_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update interview outcome',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get upcoming interviews
   */
  async getUpcomingInterviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const upcomingInterviews = await interviewService.getUpcomingInterviews(userId);

      res.json({
        success: true,
        data: upcomingInterviews
      });
    } catch (error) {
      console.error('Error fetching upcoming interviews:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_UPCOMING_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch upcoming interviews',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get interview statistics
   */
  async getInterviewStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const stats = await interviewService.getInterviewStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching interview statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_STATS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch interview statistics',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get preparation materials for a company
   */
  async getPreparationMaterials(req: Request, res: Response) {
    try {
      const { companyName } = req.params;

      if (!companyName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_COMPANY_NAME',
            message: 'Company name is required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const materials = await interviewService.getPreparationMaterials(companyName);

      res.json({
        success: true,
        data: materials
      });
    } catch (error) {
      console.error('Error fetching preparation materials:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_MATERIALS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch preparation materials',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

export default new InterviewController(); 
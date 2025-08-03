import { PrismaClient, Interview, JobApplication } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateInterviewData {
  applicationId: string;
  interviewType: 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL';
  scheduledDate: Date;
  duration: number; // in minutes
  interviewerName?: string;
  preparationNotes?: string;
}

export interface UpdateInterviewData {
  interviewType?: 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL';
  scheduledDate?: Date;
  duration?: number;
  interviewerName?: string;
  preparationNotes?: string;
  questionsAsked?: string;
  feedback?: string;
  outcome?: 'PENDING' | 'PASSED' | 'FAILED' | 'CANCELLED';
}

export interface InterviewWithApplication extends Interview {
  application: JobApplication;
}

export interface InterviewFilters {
  applicationId?: string;
  interviewType?: string;
  outcome?: string;
  scheduledDateFrom?: Date;
  scheduledDateTo?: Date;
}

class InterviewService {
  /**
   * Create a new interview
   */
  async createInterview(data: CreateInterviewData): Promise<Interview> {
    try {
      // Verify the application exists and belongs to the user
      const application = await prisma.jobApplication.findUnique({
        where: { id: data.applicationId },
        include: { user: true }
      });

      if (!application) {
        throw new Error('Job application not found');
      }

      const interview = await prisma.interview.create({
        data: {
          applicationId: data.applicationId,
          interviewType: data.interviewType,
          scheduledDate: data.scheduledDate,
          duration: data.duration,
          interviewerName: data.interviewerName,
          preparationNotes: data.preparationNotes,
          questionsAsked: '',
          outcome: 'PENDING'
        }
      });

      logger.info('Interview created successfully', { interviewId: interview.id });
      return interview;
    } catch (error) {
      logger.error('Error creating interview:', error);
      throw error;
    }
  }

  /**
   * Get all interviews for a user
   */
  async getUserInterviews(userId: string, filters?: InterviewFilters): Promise<InterviewWithApplication[]> {
    try {
      const whereClause: any = {
        application: {
          userId: userId
        }
      };

      if (filters) {
        if (filters.applicationId) {
          whereClause.applicationId = filters.applicationId;
        }
        if (filters.interviewType) {
          whereClause.interviewType = filters.interviewType;
        }
        if (filters.outcome) {
          whereClause.outcome = filters.outcome;
        }
        if (filters.scheduledDateFrom || filters.scheduledDateTo) {
          whereClause.scheduledDate = {};
          if (filters.scheduledDateFrom) {
            whereClause.scheduledDate.gte = filters.scheduledDateFrom;
          }
          if (filters.scheduledDateTo) {
            whereClause.scheduledDate.lte = filters.scheduledDateTo;
          }
        }
      }

      const interviews = await prisma.interview.findMany({
        where: whereClause,
        include: {
          application: {
            include: {
              user: true,
              resume: true
            }
          }
        },
        orderBy: {
          scheduledDate: 'desc'
        }
      });

      return interviews;
    } catch (error) {
      logger.error('Error fetching user interviews:', error);
      throw error;
    }
  }

  /**
   * Get a specific interview by ID
   */
  async getInterviewById(interviewId: string, userId: string): Promise<InterviewWithApplication | null> {
    try {
      const interview = await prisma.interview.findFirst({
        where: {
          id: interviewId,
          application: {
            userId: userId
          }
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

      return interview;
    } catch (error) {
      logger.error('Error fetching interview by ID:', error);
      throw error;
    }
  }

  /**
   * Update an interview
   */
  async updateInterview(interviewId: string, userId: string, data: UpdateInterviewData): Promise<Interview> {
    try {
      // Verify the interview exists and belongs to the user
      const existingInterview = await prisma.interview.findFirst({
        where: {
          id: interviewId,
          application: {
            userId: userId
          }
        }
      });

      if (!existingInterview) {
        throw new Error('Interview not found or access denied');
      }

      const updatedInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: data
      });

      logger.info('Interview updated successfully', { interviewId });
      return updatedInterview;
    } catch (error) {
      logger.error('Error updating interview:', error);
      throw error;
    }
  }

  /**
   * Delete an interview
   */
  async deleteInterview(interviewId: string, userId: string): Promise<void> {
    try {
      // Verify the interview exists and belongs to the user
      const existingInterview = await prisma.interview.findFirst({
        where: {
          id: interviewId,
          application: {
            userId: userId
          }
        }
      });

      if (!existingInterview) {
        throw new Error('Interview not found or access denied');
      }

      await prisma.interview.delete({
        where: { id: interviewId }
      });

      logger.info('Interview deleted successfully', { interviewId });
    } catch (error) {
      logger.error('Error deleting interview:', error);
      throw error;
    }
  }

  /**
   * Add questions asked during interview
   */
  async addInterviewQuestions(interviewId: string, userId: string, questions: string): Promise<Interview> {
    try {
      const existingInterview = await prisma.interview.findFirst({
        where: {
          id: interviewId,
          application: {
            userId: userId
          }
        }
      });

      if (!existingInterview) {
        throw new Error('Interview not found or access denied');
      }

      const updatedInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: {
          questionsAsked: questions
        }
      });

      logger.info('Interview questions added successfully', { interviewId });
      return updatedInterview;
    } catch (error) {
      logger.error('Error adding interview questions:', error);
      throw error;
    }
  }

  /**
   * Add interview feedback
   */
  async addInterviewFeedback(interviewId: string, userId: string, feedback: string): Promise<Interview> {
    try {
      const existingInterview = await prisma.interview.findFirst({
        where: {
          id: interviewId,
          application: {
            userId: userId
          }
        }
      });

      if (!existingInterview) {
        throw new Error('Interview not found or access denied');
      }

      const updatedInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: {
          feedback: feedback
        }
      });

      logger.info('Interview feedback added successfully', { interviewId });
      return updatedInterview;
    } catch (error) {
      logger.error('Error adding interview feedback:', error);
      throw error;
    }
  }

  /**
   * Update interview outcome
   */
  async updateInterviewOutcome(interviewId: string, userId: string, outcome: 'PENDING' | 'PASSED' | 'FAILED' | 'CANCELLED'): Promise<Interview> {
    try {
      const existingInterview = await prisma.interview.findFirst({
        where: {
          id: interviewId,
          application: {
            userId: userId
          }
        }
      });

      if (!existingInterview) {
        throw new Error('Interview not found or access denied');
      }

      const updatedInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: {
          outcome: outcome
        }
      });

      logger.info('Interview outcome updated successfully', { interviewId, outcome });
      return updatedInterview;
    } catch (error) {
      logger.error('Error updating interview outcome:', error);
      throw error;
    }
  }

  /**
   * Get upcoming interviews for a user
   */
  async getUpcomingInterviews(userId: string): Promise<InterviewWithApplication[]> {
    try {
      const upcomingInterviews = await prisma.interview.findMany({
        where: {
          application: {
            userId: userId
          },
          scheduledDate: {
            gte: new Date()
          },
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
        orderBy: {
          scheduledDate: 'asc'
        }
      });

      return upcomingInterviews;
    } catch (error) {
      logger.error('Error fetching upcoming interviews:', error);
      throw error;
    }
  }

  /**
   * Get interview statistics for a user
   */
  async getInterviewStats(userId: string): Promise<{
    total: number;
    upcoming: number;
    completed: number;
    passed: number;
    failed: number;
    cancelled: number;
    averageDuration: number;
  }> {
    try {
      const interviews = await prisma.interview.findMany({
        where: {
          application: {
            userId: userId
          }
        },
        include: {
          application: true
        }
      });

      const total = interviews.length;
      const upcoming = interviews.filter(i => i.scheduledDate > new Date() && i.outcome === 'PENDING').length;
      const completed = interviews.filter(i => i.outcome !== 'PENDING').length;
      const passed = interviews.filter(i => i.outcome === 'PASSED').length;
      const failed = interviews.filter(i => i.outcome === 'FAILED').length;
      const cancelled = interviews.filter(i => i.outcome === 'CANCELLED').length;
      
      const completedInterviews = interviews.filter(i => i.outcome !== 'PENDING');
      const averageDuration = completedInterviews.length > 0 
        ? completedInterviews.reduce((sum, i) => sum + i.duration, 0) / completedInterviews.length 
        : 0;

      return {
        total,
        upcoming,
        completed,
        passed,
        failed,
        cancelled,
        averageDuration: Math.round(averageDuration)
      };
    } catch (error) {
      logger.error('Error fetching interview statistics:', error);
      throw error;
    }
  }

  /**
   * Get preparation materials for a company
   */
  async getPreparationMaterials(companyName: string): Promise<{
    companyInfo: string;
    commonQuestions: string[];
    technicalTopics: string[];
    behavioralQuestions: string[];
  }> {
    // This would typically integrate with external APIs or databases
    // For now, returning mock data based on common patterns
    const commonQuestions = [
      'Tell me about yourself',
      'Why are you interested in this role?',
      'What are your strengths and weaknesses?',
      'Where do you see yourself in 5 years?',
      'Why should we hire you?'
    ];

    const technicalTopics = [
      'Data Structures and Algorithms',
      'System Design',
      'Database Design',
      'API Design',
      'Testing Strategies',
      'Performance Optimization'
    ];

    const behavioralQuestions = [
      'Describe a challenging project you worked on',
      'Tell me about a time you had to learn something quickly',
      'How do you handle working under pressure?',
      'Describe a conflict you had with a team member',
      'What is your approach to problem-solving?'
    ];

    return {
      companyInfo: `Research information about ${companyName} including their mission, values, products/services, recent news, and company culture.`,
      commonQuestions,
      technicalTopics,
      behavioralQuestions
    };
  }
}

export default new InterviewService(); 
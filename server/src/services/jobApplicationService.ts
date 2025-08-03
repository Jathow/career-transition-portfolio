import { PrismaClient } from '@prisma/client';
import { JobApplication, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateJobApplicationData {
  userId: string;
  resumeId: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  coverLetter?: string;
  notes?: string;
  followUpDate?: Date;
  companyResearch?: string;
  preparationNotes?: string;
}

export interface UpdateJobApplicationData {
  companyName?: string;
  jobTitle?: string;
  jobUrl?: string;
  status?: string;
  coverLetter?: string;
  notes?: string;
  followUpDate?: Date;
  companyResearch?: string;
  preparationNotes?: string;
}

export interface JobApplicationFilters {
  status?: string;
  companyName?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ApplicationAnalytics {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  applicationsByMonth: Record<string, number>;
  averageTimeToResponse: number;
  successRate: number;
  topCompanies: Array<{ companyName: string; count: number }>;
}

export class JobApplicationService {
  /**
   * Create a new job application
   */
  async createApplication(data: CreateJobApplicationData): Promise<JobApplication> {
    try {
      const application = await prisma.jobApplication.create({
        data: {
          userId: data.userId,
          resumeId: data.resumeId,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          jobUrl: data.jobUrl,
          coverLetter: data.coverLetter,
          notes: data.notes,
          followUpDate: data.followUpDate,
          companyResearch: data.companyResearch,
          preparationNotes: data.preparationNotes,
          status: 'APPLIED'
        },
        include: {
          resume: true,
          interviews: true
        }
      });

      return application;
    } catch (error) {
      throw new Error(`Failed to create job application: ${error}`);
    }
  }

  /**
   * Get all applications for a user with optional filters
   */
  async getUserApplications(userId: string, filters?: JobApplicationFilters): Promise<JobApplication[]> {
    try {
      const where: Prisma.JobApplicationWhereInput = {
        userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.companyName && { 
          companyName: { contains: filters.companyName } 
        }),
        ...(filters?.dateFrom && filters?.dateTo && {
          applicationDate: {
            gte: filters.dateFrom,
            lte: filters.dateTo
          }
        })
      };

      const applications = await prisma.jobApplication.findMany({
        where,
        include: {
          resume: true,
          interviews: {
            orderBy: { scheduledDate: 'desc' }
          }
        },
        orderBy: { applicationDate: 'desc' }
      });

      return applications;
    } catch (error) {
      throw new Error(`Failed to fetch job applications: ${error}`);
    }
  }

  /**
   * Get a single application by ID
   */
  async getApplicationById(applicationId: string, userId: string): Promise<JobApplication | null> {
    try {
      const application = await prisma.jobApplication.findFirst({
        where: {
          id: applicationId,
          userId
        },
        include: {
          resume: true,
          interviews: {
            orderBy: { scheduledDate: 'desc' }
          }
        }
      });

      return application;
    } catch (error) {
      throw new Error(`Failed to fetch job application: ${error}`);
    }
  }

  /**
   * Update an application
   */
  async updateApplication(
    applicationId: string, 
    userId: string, 
    data: UpdateJobApplicationData
  ): Promise<JobApplication> {
    try {
      const application = await prisma.jobApplication.findFirst({
        where: { id: applicationId, userId }
      });

      if (!application) {
        throw new Error('Job application not found');
      }

      const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data,
        include: {
          resume: true,
          interviews: true
        }
      });

      return updatedApplication;
    } catch (error) {
      throw new Error(`Failed to update job application: ${error}`);
    }
  }

  /**
   * Update application status with validation
   */
  async updateApplicationStatus(
    applicationId: string, 
    userId: string, 
    newStatus: string
  ): Promise<JobApplication> {
    try {
      const validStatuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];
      
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const application = await prisma.jobApplication.findFirst({
        where: { id: applicationId, userId }
      });

      if (!application) {
        throw new Error('Job application not found');
      }

      const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { 
          status: newStatus,
          updatedAt: new Date()
        },
        include: {
          resume: true,
          interviews: true
        }
      });

      return updatedApplication;
    } catch (error) {
      throw new Error(`Failed to update application status: ${error}`);
    }
  }

  /**
   * Add notes to an application
   */
  async addApplicationNotes(
    applicationId: string, 
    userId: string, 
    notes: string
  ): Promise<JobApplication> {
    try {
      const application = await prisma.jobApplication.findFirst({
        where: { id: applicationId, userId }
      });

      if (!application) {
        throw new Error('Job application not found');
      }

      const currentNotes = application.notes || '';
      const updatedNotes = currentNotes ? `${currentNotes}\n\n${new Date().toISOString()}: ${notes}` : notes;

      const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { 
          notes: updatedNotes,
          updatedAt: new Date()
        },
        include: {
          resume: true,
          interviews: true
        }
      });

      return updatedApplication;
    } catch (error) {
      throw new Error(`Failed to add application notes: ${error}`);
    }
  }

  /**
   * Delete an application
   */
  async deleteApplication(applicationId: string, userId: string): Promise<void> {
    try {
      const application = await prisma.jobApplication.findFirst({
        where: { id: applicationId, userId }
      });

      if (!application) {
        throw new Error('Job application not found');
      }

      await prisma.jobApplication.delete({
        where: { id: applicationId }
      });
    } catch (error) {
      throw new Error(`Failed to delete job application: ${error}`);
    }
  }

  /**
   * Get applications that need follow-up
   */
  async getApplicationsNeedingFollowUp(userId: string): Promise<JobApplication[]> {
    try {
      const applications = await prisma.jobApplication.findMany({
        where: {
          userId,
          status: { in: ['APPLIED', 'SCREENING'] },
          followUpDate: {
            lte: new Date()
          }
        },
        include: {
          resume: true,
          interviews: true
        },
        orderBy: { followUpDate: 'asc' }
      });

      return applications;
    } catch (error) {
      throw new Error(`Failed to fetch applications needing follow-up: ${error}`);
    }
  }

  /**
   * Get application analytics for a user
   */
  async getApplicationAnalytics(userId: string): Promise<ApplicationAnalytics> {
    try {
      const applications = await prisma.jobApplication.findMany({
        where: { userId },
        include: { interviews: true }
      });

      // Calculate status distribution
      const applicationsByStatus: Record<string, number> = {};
      applications.forEach(app => {
        applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
      });

      // Calculate monthly distribution
      const applicationsByMonth: Record<string, number> = {};
      applications.forEach(app => {
        const month = app.applicationDate.toISOString().substring(0, 7); // YYYY-MM
        applicationsByMonth[month] = (applicationsByMonth[month] || 0) + 1;
      });

      // Calculate top companies
      const companyCounts: Record<string, number> = {};
      applications.forEach(app => {
        companyCounts[app.companyName] = (companyCounts[app.companyName] || 0) + 1;
      });

      const topCompanies = Object.entries(companyCounts)
        .map(([companyName, count]) => ({ companyName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate success rate (OFFER status)
      const totalApplications = applications.length;
      const successfulApplications = applications.filter(app => app.status === 'OFFER').length;
      const successRate = totalApplications > 0 ? (successfulApplications / totalApplications) * 100 : 0;

      // Calculate average time to response (simplified - using first interview date)
      const applicationsWithInterviews = applications.filter(app => app.interviews.length > 0);
      let totalResponseTime = 0;
      let responseCount = 0;

      applicationsWithInterviews.forEach(app => {
        const firstInterview = app.interviews[0];
        if (firstInterview) {
          const responseTime = firstInterview.scheduledDate.getTime() - app.applicationDate.getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      });

      const averageTimeToResponse = responseCount > 0 ? totalResponseTime / responseCount / (1000 * 60 * 60 * 24) : 0; // in days

      return {
        totalApplications,
        applicationsByStatus,
        applicationsByMonth,
        averageTimeToResponse: Math.round(averageTimeToResponse * 10) / 10,
        successRate: Math.round(successRate * 10) / 10,
        topCompanies
      };
    } catch (error) {
      throw new Error(`Failed to calculate application analytics: ${error}`);
    }
  }

  /**
   * Search applications by company name or job title
   */
  async searchApplications(userId: string, searchTerm: string): Promise<JobApplication[]> {
    try {
      const applications = await prisma.jobApplication.findMany({
        where: {
          userId,
          OR: [
            { companyName: { contains: searchTerm } },
            { jobTitle: { contains: searchTerm } },
            { notes: { contains: searchTerm } }
          ]
        },
        include: {
          resume: true,
          interviews: {
            orderBy: { scheduledDate: 'desc' }
          }
        },
        orderBy: { applicationDate: 'desc' }
      });

      return applications;
    } catch (error) {
      throw new Error(`Failed to search applications: ${error}`);
    }
  }
}

export default new JobApplicationService(); 
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface TemplateImportOptions {
  userId: string;
  templateId: string;
  importSections: string[];
  customProjectName?: string;
}

export interface ImportResult {
  success: boolean;
  projectId?: string;
  importedSections: string[];
  message: string;
  errors?: string[];
}

export class TemplateImportService {
  async importTemplate(options: TemplateImportOptions): Promise<ImportResult> {
    const { userId, templateId, importSections, customProjectName } = options;
    const errors: string[] = [];
    let projectId: string | undefined;

    try {
      // Load template data
      const templateData = await this.loadTemplateData(templateId);
      if (!templateData) {
        return {
          success: false,
          importedSections: [],
          message: 'Template not found',
          errors: ['Template file not found']
        };
      }

      // Start database transaction
      await prisma.$transaction(async (tx) => {
        // 1. Create the main project
        if (templateData.project) {
          const projectData = {
            userId,
            title: customProjectName || templateData.project.title,
            description: templateData.project.description,
            techStack: Array.isArray(templateData.project.technologies) 
              ? templateData.project.technologies.join(', ') 
              : templateData.project.technologies || '',
            startDate: new Date(templateData.project.startDate || new Date()),
            targetEndDate: new Date(templateData.project.endDate || new Date()),
            status: templateData.project.status || 'COMPLETED',
            repositoryUrl: templateData.project.githubUrl,
            liveUrl: templateData.project.liveUrl,
            revenueTracking: templateData.project.revenueTracking || false,
            marketResearch: templateData.project.marketResearch,
          };

          const project = await tx.project.create({
            data: projectData
          });

          projectId = project.id;
          logger.info('Created project from template', { projectId, userId });
        }

        // 2. Import resume data
        if (importSections.includes('resume') && templateData.resume && projectId) {
          await this.importResumeData(tx, userId, projectId, templateData.resume);
        }

        // 3. Import portfolio data
        if (importSections.includes('portfolio') && templateData.portfolio && projectId) {
          await this.importPortfolioData(tx, userId, projectId, templateData.portfolio);
        }

        // 4. Import market research data
        if (importSections.includes('market') && templateData.marketResearch && projectId) {
          await this.importMarketResearchData(tx, userId, projectId, templateData.marketResearch);
        }

        // 5. Import revenue metrics
        if (importSections.includes('revenue') && templateData.revenueMetrics && projectId) {
          await this.importRevenueMetricsData(tx, userId, projectId, templateData.revenueMetrics);
        }

        // 6. Import monetization strategies
        if (importSections.includes('monetization') && templateData.monetizationStrategies && projectId) {
          await this.importMonetizationStrategiesData(tx, userId, projectId, templateData.monetizationStrategies);
        }

        // 7. Import project analytics
        if (importSections.includes('analytics') && templateData.projectAnalytics && projectId) {
          await this.importProjectAnalyticsData(tx, userId, projectId, templateData.projectAnalytics);
        }

        // 8. Import motivation data
        if (importSections.includes('motivation') && templateData.motivation) {
          await this.importMotivationData(tx, userId, templateData.motivation);
        }

        // 9. Import goals
        if (importSections.includes('goals') && templateData.goals) {
          await this.importGoalsData(tx, userId, templateData.goals);
        }

        // 10. Import achievements
        if (importSections.includes('achievements') && templateData.achievements) {
          await this.importAchievementsData(tx, userId, templateData.achievements);
        }

        // 11. Import motivational feedback
        if (importSections.includes('feedback') && templateData.motivationalFeedback) {
          await this.importMotivationalFeedbackData(tx, userId, templateData.motivationalFeedback);
        }

        // 12. Import user preferences
        if (importSections.includes('preferences') && templateData.userPreferences) {
          await this.importUserPreferencesData(tx, userId, templateData.userPreferences);
        }

        // 13. Import job applications
        if (importSections.includes('applications') && templateData.jobApplications) {
          await this.importJobApplicationsData(tx, userId, templateData.jobApplications);
        }

        // 14. Import interviews
        if (importSections.includes('interviews') && templateData.interviews) {
          await this.importInterviewsData(tx, userId, templateData.interviews);
        }

        // 15. Import time tracking
        if (importSections.includes('timeTracking') && templateData.timeTracking) {
          await this.importTimeTrackingData(tx, userId, templateData.timeTracking);
        }

        // 16. Import notifications
        if (importSections.includes('notifications') && templateData.notifications) {
          await this.importNotificationsData(tx, userId, templateData.notifications);
        }

      });

      logger.info('Template import completed successfully', { 
        userId, 
        templateId, 
        projectId, 
        importedSections: importSections 
      });

      return {
        success: true,
        projectId,
        importedSections,
        message: 'Template imported successfully',
        errors
      };

    } catch (error) {
      logger.error('Template import failed', { error, userId, templateId });
      return {
        success: false,
        importedSections: [],
        message: 'Failed to import template',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async loadTemplateData(templateId: string): Promise<any> {
    const fs = require('fs');
    const path = require('path');
    
    const templatePath = path.join(__dirname, '../../career-portfolio-platform-project.json');
    
    if (!fs.existsSync(templatePath)) {
      return null;
    }

    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    return templateData;
  }

  private async importResumeData(tx: any, userId: string, projectId: string, resumeData: any) {
    if (resumeData.projectEntry) {
      // Create a resume entry based on the project
      const resumeContent = {
        personalInfo: {
          firstName: "Your",
          lastName: "Name",
          email: "your.email@example.com",
          phone: "+1 (555) 123-4567",
          location: "Your Location",
          linkedin: "https://linkedin.com/in/yourname",
          github: "https://github.com/yourusername"
        },
        summary: resumeData.projectEntry.description || "Full-stack developer with expertise in modern web technologies.",
        experience: [{
          company: resumeData.projectEntry.company || "Personal Projects",
          position: resumeData.projectEntry.title || "Full-Stack Developer",
          startDate: "2024-01-01",
          endDate: "Present",
          description: resumeData.projectEntry.achievements || [],
          technologies: resumeData.projectEntry.technologies ? 
            resumeData.projectEntry.technologies.split(', ') : []
        }],
        projects: [{
          title: "Career Portfolio Platform",
          description: resumeData.projectEntry.description || "Full-stack web application for career management",
          technologies: resumeData.projectEntry.technologies ? 
            resumeData.projectEntry.technologies.split(', ') : [],
          repositoryUrl: "https://github.com/Jathow/career-transition-portfolio",
          liveUrl: "https://careerportfolio.dev"
        }],
        skills: {
          technical: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
          soft: ["Problem Solving", "Team Collaboration", "Project Management"]
        },
        education: [{
          institution: "Your University",
          degree: "Your Degree",
          field: "Computer Science",
          graduationDate: "2020",
          gpa: "3.8"
        }]
      };

      await tx.resume.create({
        data: {
          userId,
          versionName: "Template Import v1.0",
          templateId: "modern-professional",
          content: JSON.stringify(resumeContent),
          isDefault: true
        }
      });
    }
  }

  private async importPortfolioData(tx: any, userId: string, projectId: string, portfolioData: any) {
    if (portfolioData.showcase) {
      await tx.portfolio.create({
        data: {
          userId,
          title: portfolioData.showcase.title || "My Portfolio",
          subtitle: portfolioData.showcase.subtitle,
          description: portfolioData.showcase.description,
          theme: "default",
          isPublic: true,
          seoTitle: portfolioData.showcase.title,
          seoDescription: portfolioData.showcase.description,
          analyticsEnabled: true
        }
      });
    }
  }

  private async importMarketResearchData(tx: any, userId: string, projectId: string, marketResearchData: any[]) {
    for (const research of marketResearchData) {
      await tx.marketResearch.create({
        data: {
          projectId,
          researchType: research.researchType,
          title: research.title,
          description: research.description,
          targetMarket: research.targetMarket,
          marketSize: research.marketSize,
          competitionLevel: research.competitionLevel,
          entryBarriers: research.entryBarriers,
          monetizationPotential: research.monetizationPotential,
          researchData: research.researchData,
          insights: research.insights,
          recommendations: research.recommendations
        }
      });
    }
  }

  private async importRevenueMetricsData(tx: any, userId: string, projectId: string, revenueMetricsData: any[]) {
    for (const metric of revenueMetricsData) {
      await tx.revenueMetric.create({
        data: {
          projectId,
          metricType: metric.metricType,
          metricName: metric.metricName,
          value: metric.value,
          unit: metric.unit,
          period: metric.period,
          date: new Date(metric.date),
          notes: metric.notes
        }
      });
    }
  }

  private async importMonetizationStrategiesData(tx: any, userId: string, projectId: string, strategiesData: any[]) {
    for (const strategy of strategiesData) {
      await tx.monetizationStrategy.create({
        data: {
          projectId,
          strategyType: strategy.strategyType,
          title: strategy.title,
          description: strategy.description,
          targetAudience: strategy.targetAudience,
          pricingModel: strategy.pricingModel,
          revenueProjection: strategy.revenueProjection,
          implementationPlan: strategy.implementationPlan,
          status: strategy.status,
          priority: strategy.priority
        }
      });
    }
  }

  private async importProjectAnalyticsData(tx: any, userId: string, projectId: string, analyticsData: any[]) {
    for (const analytics of analyticsData) {
      await tx.projectAnalytics.create({
        data: {
          projectId,
          analyticsType: analytics.analyticsType,
          metricName: analytics.metricName,
          value: analytics.value,
          date: new Date(analytics.date),
          metadata: analytics.metadata
        }
      });
    }
  }

  private async importMotivationData(tx: any, userId: string, motivationData: any) {
    if (motivationData.dailyLogs) {
      for (const log of motivationData.dailyLogs) {
        await tx.dailyLog.create({
          data: {
            userId,
            date: new Date(log.date),
            codingMinutes: log.hoursWorked * 60,
            applicationsSubmitted: 0,
            learningMinutes: 0,
            notes: log.notes,
            mood: this.mapMoodToEnum(log.mood),
            energyLevel: log.energyLevel,
            productivity: Math.round(log.mood * 10),
            challenges: log.challenges ? log.challenges.join(', ') : null,
            achievements: log.achievements ? log.achievements.join(', ') : null
          }
        });
      }
    }
  }

  private async importGoalsData(tx: any, userId: string, goalsData: any[]) {
    for (const goal of goalsData) {
      await tx.goal.create({
        data: {
          userId,
          title: goal.title,
          description: goal.description,
          type: goal.type,
          targetValue: goal.targetValue,
          currentValue: goal.currentValue,
          unit: goal.unit,
          startDate: new Date(goal.startDate),
          endDate: new Date(goal.endDate),
          status: goal.status,
          priority: goal.priority
        }
      });
    }
  }

  private async importAchievementsData(tx: any, userId: string, achievementsData: any[]) {
    for (const achievement of achievementsData) {
      await tx.achievement.create({
        data: {
          userId,
          title: achievement.title,
          description: achievement.description,
          type: achievement.type,
          icon: achievement.icon,
          metadata: achievement.metadata
        }
      });
    }
  }

  private async importMotivationalFeedbackData(tx: any, userId: string, feedbackData: any[]) {
    for (const feedback of feedbackData) {
      await tx.motivationalFeedback.create({
        data: {
          userId,
          type: feedback.type,
          title: feedback.title,
          message: feedback.message,
          priority: feedback.priority,
          isRead: feedback.isRead,
          expiresAt: feedback.expiresAt ? new Date(feedback.expiresAt) : null,
          metadata: feedback.metadata
        }
      });
    }
  }

  private async importUserPreferencesData(tx: any, userId: string, preferencesData: any) {
    await tx.userPreferences.upsert({
      where: { userId },
      update: {
        darkMode: preferencesData.darkMode,
        compactMode: preferencesData.compactMode,
        autoSave: preferencesData.autoSave,
        showTutorials: preferencesData.showTutorials,
        emailNotifications: preferencesData.emailNotifications,
        pushNotifications: preferencesData.pushNotifications,
        reminderNotifications: preferencesData.reminderNotifications,
        updateNotifications: preferencesData.updateNotifications
      },
      create: {
        userId,
        darkMode: preferencesData.darkMode,
        compactMode: preferencesData.compactMode,
        autoSave: preferencesData.autoSave,
        showTutorials: preferencesData.showTutorials,
        emailNotifications: preferencesData.emailNotifications,
        pushNotifications: preferencesData.pushNotifications,
        reminderNotifications: preferencesData.reminderNotifications,
        updateNotifications: preferencesData.updateNotifications
      }
    });
  }

  private async importJobApplicationsData(tx: any, userId: string, applicationsData: any[]) {
    // First, ensure we have a default resume
    const defaultResume = await tx.resume.findFirst({
      where: { userId, isDefault: true }
    });

    if (!defaultResume) {
      // Create a default resume if none exists
      const defaultResume = await tx.resume.create({
        data: {
          userId,
          versionName: "Default Resume",
          templateId: "modern-professional",
          content: JSON.stringify({
            personalInfo: { firstName: "Your", lastName: "Name", email: "your.email@example.com" },
            summary: "Full-stack developer",
            experience: [],
            projects: [],
            skills: { technical: [], soft: [] },
            education: []
          }),
          isDefault: true
        }
      });
    }

    for (const application of applicationsData) {
      await tx.jobApplication.create({
        data: {
          userId,
          resumeId: defaultResume.id,
          companyName: application.company,
          jobTitle: application.position,
          jobUrl: application.jobUrl,
          applicationDate: new Date(application.applicationDate),
          status: this.mapApplicationStatus(application.status),
          notes: application.notes,
          followUpDate: application.followUpDate ? new Date(application.followUpDate) : null,
          companyResearch: application.companyResearch,
          preparationNotes: application.preparationNotes
        }
      });
    }
  }

  private async importInterviewsData(tx: any, userId: string, interviewsData: any[]) {
    for (const interview of interviewsData) {
      // Find the corresponding job application
      const application = await tx.jobApplication.findFirst({
        where: {
          userId,
          companyName: interview.company,
          jobTitle: interview.position
        }
      });

      if (application) {
        await tx.interview.create({
          data: {
            applicationId: application.id,
            interviewType: interview.type,
            scheduledDate: new Date(interview.interviewDate),
            duration: interview.duration,
            interviewerName: interview.interviewers ? 
              interview.interviewers.map((i: any) => i.name).join(', ') : null,
            preparationNotes: interview.preparationNotes ? 
              interview.preparationNotes.join('\n') : null,
            questionsAsked: interview.questionsToAsk ? 
              interview.questionsToAsk.join('\n') : null,
            feedback: interview.feedback,
            outcome: interview.outcome || 'PENDING'
          }
        });
      }
    }
  }

  private async importTimeTrackingData(tx: any, userId: string, timeTrackingData: any[]) {
    // Note: The current schema doesn't have a dedicated time tracking table
    // This would need to be implemented as part of the project tracking
    // For now, we'll log this data for future implementation
    logger.info('Time tracking data import requested', { 
      userId, 
      entries: timeTrackingData.length 
    });
  }

  private async importNotificationsData(tx: any, userId: string, notificationsData: any[]) {
    for (const notification of notificationsData) {
      await tx.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: 'medium',
          read: notification.read,
          metadata: JSON.stringify({
            actionUrl: notification.actionUrl,
            originalDate: notification.date
          })
        }
      });
    }
  }

  private mapMoodToEnum(mood: number): string {
    if (mood >= 8) return 'excellent';
    if (mood >= 6) return 'good';
    if (mood >= 4) return 'okay';
    return 'poor';
  }

  private mapApplicationStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Applied': 'APPLIED',
      'Application Viewed': 'SCREENING',
      'Interview Scheduled': 'INTERVIEW',
      'Interview Completed': 'INTERVIEW',
      'Offer Received': 'OFFER',
      'Rejected': 'REJECTED',
      'Withdrawn': 'WITHDRAWN'
    };
    return statusMap[status] || 'APPLIED';
  }
}

export const templateImportService = new TemplateImportService(); 
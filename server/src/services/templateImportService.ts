import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ProjectImportOptions {
  userId: string;
  customProjectName?: string;
}

export interface CustomTemplateImportOptions {
  userId: string;
  templateData: any;
  customProjectName?: string;
}

export interface ImportResult {
  success: boolean;
  projectId?: string;
  message: string;
  errors?: string[];
}

export class TemplateImportService {
  async importProject(options: ProjectImportOptions): Promise<ImportResult> {
    const { userId, customProjectName } = options;

    try {
      // Load template data
      const templateData = await this.loadTemplateData();
      if (!templateData) {
        return {
          success: false,
          message: 'Template not found',
          errors: ['Template file not found']
        };
      }

      return await this.importTemplateData(userId, templateData, customProjectName);

    } catch (error) {
      logger.error('Project import failed', { error, userId });
      return {
        success: false,
        message: 'Failed to import project',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async importCustomTemplate(options: CustomTemplateImportOptions): Promise<ImportResult> {
    const { userId, templateData, customProjectName } = options;

    try {
      // Validate template data structure
      if (!templateData || !templateData.project) {
        return {
          success: false,
          message: 'Invalid template data structure',
          errors: ['Template must contain a project object']
        };
      }

      return await this.importTemplateData(userId, templateData, customProjectName);

    } catch (error) {
      logger.error('Custom template import failed', { error, userId });
      return {
        success: false,
        message: 'Failed to import custom template',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async importTemplateData(userId: string, templateData: any, customProjectName?: string): Promise<ImportResult> {
    try {
      // Start database transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the main project with all available fields
        const projectData = {
          userId,
          title: customProjectName || templateData.project.title,
          description: templateData.project.description,
          techStack: Array.isArray(templateData.project.technologies) 
            ? templateData.project.technologies.join(', ') 
            : templateData.project.technologies || '',
          startDate: new Date(templateData.project.startDate || new Date()),
          targetEndDate: new Date(templateData.project.endDate || new Date()),
          actualEndDate: templateData.project.status === 'COMPLETED' ? new Date(templateData.project.endDate || new Date()) : null,
          status: templateData.project.status || 'COMPLETED',
          repositoryUrl: templateData.project.githubUrl,
          liveUrl: templateData.project.liveUrl,
          revenueTracking: templateData.project.revenueTracking || false,
          marketResearch: templateData.project.marketResearch || null,
        };

        const project = await tx.project.create({
          data: projectData
        });

        logger.info('Created project from template', { projectId: project.id, userId });

        // 2. Import market research data (related to project)
        if (templateData.marketResearch && templateData.marketResearch.length > 0) {
          for (const research of templateData.marketResearch) {
            await tx.marketResearch.create({
              data: {
                projectId: project.id,
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

        // 3. Import revenue metrics (related to project)
        if (templateData.revenueMetrics && templateData.revenueMetrics.length > 0) {
          for (const metric of templateData.revenueMetrics) {
            await tx.revenueMetric.create({
              data: {
                projectId: project.id,
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

        // 4. Import monetization strategies (related to project)
        if (templateData.monetizationStrategies && templateData.monetizationStrategies.length > 0) {
          for (const strategy of templateData.monetizationStrategies) {
            await tx.monetizationStrategy.create({
              data: {
                projectId: project.id,
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

        // 5. Import project analytics (related to project)
        if (templateData.projectAnalytics && templateData.projectAnalytics.length > 0) {
          for (const analytics of templateData.projectAnalytics) {
            await tx.projectAnalytics.create({
              data: {
                projectId: project.id,
                analyticsType: analytics.analyticsType,
                metricName: analytics.metricName,
                value: analytics.value,
                date: new Date(analytics.date),
                metadata: analytics.metadata
              }
            });
          }
        }

        // 6. Import resume data (standalone)
        if (templateData.resume && templateData.resume.projectEntry) {
          const resumeContent = this.createResumeContent(templateData.resume.projectEntry);
          await tx.resume.create({
            data: {
              userId,
              versionName: "Career Portfolio Platform Template",
              templateId: "modern-professional",
              content: JSON.stringify(resumeContent),
              isDefault: true
            }
          });
        }

        // 7. Import portfolio data (standalone)
        if (templateData.portfolio && templateData.portfolio.showcase) {
          await tx.portfolio.create({
            data: {
              userId,
              title: templateData.portfolio.showcase.title || "My Portfolio",
              subtitle: templateData.portfolio.showcase.subtitle,
              description: templateData.portfolio.showcase.description,
              theme: "default",
              isPublic: true,
              seoTitle: templateData.portfolio.showcase.title,
              seoDescription: templateData.portfolio.showcase.description,
              analyticsEnabled: true
            }
          });
        }

        // 8. Import motivation data (standalone)
        if (templateData.motivation && templateData.motivation.dailyLogs) {
          for (const log of templateData.motivation.dailyLogs) {
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

        // 9. Import goals (standalone)
        if (templateData.goals && templateData.goals.length > 0) {
          for (const goal of templateData.goals) {
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

        // 10. Import achievements (standalone)
        if (templateData.achievements && templateData.achievements.length > 0) {
          for (const achievement of templateData.achievements) {
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

        // 11. Import motivational feedback (standalone)
        if (templateData.motivationalFeedback && templateData.motivationalFeedback.length > 0) {
          for (const feedback of templateData.motivationalFeedback) {
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

        // 12. Import user preferences (standalone)
        if (templateData.userPreferences) {
          await tx.userPreferences.upsert({
            where: { userId },
            update: {
              darkMode: templateData.userPreferences.darkMode,
              compactMode: templateData.userPreferences.compactMode,
              autoSave: templateData.userPreferences.autoSave,
              showTutorials: templateData.userPreferences.showTutorials,
              emailNotifications: templateData.userPreferences.emailNotifications,
              pushNotifications: templateData.userPreferences.pushNotifications,
              reminderNotifications: templateData.userPreferences.reminderNotifications,
              updateNotifications: templateData.userPreferences.updateNotifications
            },
            create: {
              userId,
              darkMode: templateData.userPreferences.darkMode,
              compactMode: templateData.userPreferences.compactMode,
              autoSave: templateData.userPreferences.autoSave,
              showTutorials: templateData.userPreferences.showTutorials,
              emailNotifications: templateData.userPreferences.emailNotifications,
              pushNotifications: templateData.userPreferences.pushNotifications,
              reminderNotifications: templateData.userPreferences.reminderNotifications,
              updateNotifications: templateData.userPreferences.updateNotifications
            }
          });
        }

        // 13. Import job applications and interviews (standalone)
        if (templateData.jobApplications && templateData.jobApplications.length > 0) {
          // First, ensure we have a default resume
          let defaultResume = await tx.resume.findFirst({
            where: { userId, isDefault: true }
          });

          if (!defaultResume) {
            defaultResume = await tx.resume.create({
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

          for (const application of templateData.jobApplications) {
            const createdApplication = await tx.jobApplication.create({
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

            // Import related interviews
            if (templateData.interviews) {
              const relatedInterviews = templateData.interviews.filter(
                (interview: any) => interview.company === application.company && interview.position === application.position
              );

              for (const interview of relatedInterviews) {
                await tx.interview.create({
                  data: {
                    applicationId: createdApplication.id,
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
        }

        // 14. Import notifications (standalone)
        if (templateData.notifications && templateData.notifications.length > 0) {
          for (const notification of templateData.notifications) {
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

        return project.id;
      });

      logger.info('Template import completed successfully', { 
        userId, 
        projectId: result
      });

      return {
        success: true,
        projectId: result,
        message: 'Template imported successfully'
      };

    } catch (error) {
      logger.error('Template import failed', { error, userId });
      return {
        success: false,
        message: 'Failed to import template',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async loadTemplateData(): Promise<any> {
    const fs = require('fs');
    const path = require('path');
    
    const templatePath = path.join(__dirname, '../../career-portfolio-platform-project.json');
    
    if (!fs.existsSync(templatePath)) {
      return null;
    }

    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    return templateData;
  }

  private createResumeContent(projectEntry: any) {
    return {
      personalInfo: {
        firstName: "Your",
        lastName: "Name",
        email: "your.email@example.com",
        phone: "+1 (555) 123-4567",
        location: "Your Location",
        linkedin: "https://linkedin.com/in/yourname",
        github: "https://github.com/yourusername"
      },
      summary: projectEntry.description || "Full-stack developer with expertise in modern web technologies.",
      experience: [{
        company: projectEntry.company || "Personal Projects",
        position: projectEntry.title || "Full-Stack Developer",
        startDate: "2024-01-01",
        endDate: "Present",
        description: projectEntry.achievements || [],
        technologies: projectEntry.technologies ? 
          projectEntry.technologies.split(', ') : []
      }],
      projects: [{
        title: "Career Portfolio Platform",
        description: projectEntry.description || "Full-stack web application for career management",
        technologies: projectEntry.technologies ? 
          projectEntry.technologies.split(', ') : [],
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
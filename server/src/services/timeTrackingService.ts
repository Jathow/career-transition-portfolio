import { PrismaClient } from '@prisma/client';
import { Project } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProjectProgress {
  projectId: string;
  title: string;
  status: string;
  progress: number;
  timeRemaining: number;
  isOverdue: boolean;
  daysUntilDeadline: number;
  completionRate: number;
}

export interface DeadlineNotification {
  projectId: string;
  title: string;
  daysUntilDeadline: number;
  isOverdue: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export class TimeTrackingService {
  /**
   * Calculate project progress and time remaining
   */
  static async calculateProjectProgress(projectId: string): Promise<ProjectProgress | null> {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return null;

    const now = new Date();
    const startDate = new Date(project.startDate);
    const targetEndDate = new Date(project.targetEndDate);
    
    // Calculate total project duration in days
    const totalDuration = Math.ceil((targetEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate elapsed time in days
    const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate remaining time in days
    const remainingDays = Math.ceil((targetEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, (elapsedDays / totalDuration) * 100));
    
    // Determine if project is overdue
    const isOverdue = remainingDays < 0;
    
    // Calculate completion rate based on status
    let completionRate = progress;
    switch (project.status) {
      case 'COMPLETED':
        completionRate = 100;
        break;
      case 'IN_PROGRESS':
        completionRate = Math.min(100, progress + 25); // Assume some work has been done
        break;
      case 'PAUSED':
        completionRate = progress * 0.5; // Reduce completion rate for paused projects
        break;
      case 'PLANNING':
        completionRate = Math.min(20, progress); // Cap at 20% for planning
        break;
    }

    return {
      projectId: project.id,
      title: project.title,
      status: project.status,
      progress: Math.round(progress * 100) / 100,
      timeRemaining: remainingDays,
      isOverdue,
      daysUntilDeadline: remainingDays,
      completionRate: Math.round(completionRate * 100) / 100
    };
  }

  /**
   * Get all projects with their progress information
   */
  static async getAllProjectsProgress(userId: string): Promise<ProjectProgress[]> {
    const projects = await prisma.project.findMany({
      where: { userId }
    });

    const progressPromises = projects.map(project => 
      this.calculateProjectProgress(project.id)
    );

    const progressResults = await Promise.all(progressPromises);
    return progressResults.filter((progress): progress is ProjectProgress => progress !== null);
  }

  /**
   * Check for projects approaching deadlines
   */
  static async getDeadlineNotifications(userId: string): Promise<DeadlineNotification[]> {
    const projects = await prisma.project.findMany({
      where: { 
        userId,
        status: { not: 'COMPLETED' }
      }
    });

    const now = new Date();
    const notifications: DeadlineNotification[] = [];

    for (const project of projects) {
      const targetEndDate = new Date(project.targetEndDate);
      const daysUntilDeadline = Math.ceil((targetEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline <= 7) { // Only notify for projects within 7 days of deadline
        const isOverdue = daysUntilDeadline < 0;
        
        let urgency: 'low' | 'medium' | 'high' | 'critical';
        if (isOverdue) {
          urgency = 'critical';
        } else if (daysUntilDeadline <= 1) {
          urgency = 'high';
        } else if (daysUntilDeadline <= 3) {
          urgency = 'medium';
        } else {
          urgency = 'low';
        }

        notifications.push({
          projectId: project.id,
          title: project.title,
          daysUntilDeadline,
          isOverdue,
          urgency
        });
      }
    }

    return notifications.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
  }

  /**
   * Get project timeline data for visualization
   */
  static async getProjectTimeline(userId: string): Promise<{
    labels: string[];
    progress: number[];
    deadlines: string[];
    overdue: boolean[];
  }> {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { targetEndDate: 'asc' }
    });

    const labels: string[] = [];
    const progress: number[] = [];
    const deadlines: string[] = [];
    const overdue: boolean[] = [];

    for (const project of projects) {
      const progressData = await this.calculateProjectProgress(project.id);
      if (progressData) {
        labels.push(project.title);
        progress.push(progressData.completionRate);
        deadlines.push(project.targetEndDate.toISOString().split('T')[0]);
        overdue.push(progressData.isOverdue);
      }
    }

    return { labels, progress, deadlines, overdue };
  }

  /**
   * Get user's overall progress statistics
   */
  static async getUserProgressStats(userId: string): Promise<{
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    overdueProjects: number;
    averageProgress: number;
    upcomingDeadlines: number;
  }> {
    const projects = await prisma.project.findMany({
      where: { userId }
    });

    const progressData = await this.getAllProjectsProgress(userId);
    
    const now = new Date();
    const upcomingDeadlines = projects.filter(project => {
      const deadline = new Date(project.targetEndDate);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline > 0 && daysUntilDeadline <= 7;
    }).length;

    const averageProgress = progressData.length > 0 
      ? progressData.reduce((sum, project) => sum + project.completionRate, 0) / progressData.length
      : 0;

    return {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
      inProgressProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
      overdueProjects: progressData.filter(p => p.isOverdue).length,
      averageProgress: Math.round(averageProgress * 100) / 100,
      upcomingDeadlines
    };
  }

  /**
   * Update project status based on deadline
   */
  static async updateProjectStatusByDeadline(): Promise<void> {
    const now = new Date();
    const overdueProjects = await prisma.project.findMany({
      where: {
        status: { in: ['PLANNING', 'IN_PROGRESS'] },
        targetEndDate: { lt: now }
      }
    });

    // Mark overdue projects as paused (could be changed to 'OVERDUE' if you add that status)
    for (const project of overdueProjects) {
      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'PAUSED' }
      });
    }
  }
} 
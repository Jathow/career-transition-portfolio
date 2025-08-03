import { PrismaClient, Project } from '@prisma/client';
import { CreateProjectData, UpdateProjectData, ProjectWithProgress, ProjectStatus } from '../types/project';
import { NotificationService } from './notificationService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ProjectService {
  async createProject(userId: string, data: CreateProjectData): Promise<Project> {
    const techStackString = Array.isArray(data.techStack) ? data.techStack.join(', ') : (data.techStack || '');
    
    return await prisma.project.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        techStack: techStackString as any,
        startDate: data.startDate || new Date(),
        targetEndDate: data.targetEndDate,
        status: data.status || 'PLANNING',
        repositoryUrl: data.repositoryUrl,
        liveUrl: data.liveUrl,
        revenueTracking: data.revenueTracking || false,
        marketResearch: data.marketResearch,
      },
    });
  }

  async getUserProjects(userId: string): Promise<ProjectWithProgress[]> {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map(project => ({
      ...project,
      techStack: project.techStack ? project.techStack.split(', ').map(tech => tech.trim()) : [],
      progress: this.calculateProgress(project),
      timeRemaining: this.calculateTimeRemaining(project),
      isOverdue: this.isProjectOverdue(project),
    }));
  }

  async getProjectById(userId: string, projectId: string): Promise<ProjectWithProgress | null> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) return null;

    return {
      ...project,
      techStack: project.techStack ? project.techStack.split(', ').map(tech => tech.trim()) : [],
      progress: this.calculateProgress(project),
      timeRemaining: this.calculateTimeRemaining(project),
      isOverdue: this.isProjectOverdue(project),
    };
  }

  async updateProject(userId: string, projectId: string, data: UpdateProjectData): Promise<ProjectWithProgress> {
    // Validate ownership
    const existingProject = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!existingProject) {
      throw new Error('Project not found or access denied');
    }

    // Convert techStack array to string if present
    const updateData: any = { ...data };
    if (updateData.techStack && Array.isArray(updateData.techStack)) {
      updateData.techStack = updateData.techStack.join(', ');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      } as any,
    });

    return {
      ...updatedProject,
      techStack: updatedProject.techStack ? updatedProject.techStack.split(', ').map(tech => tech.trim()) : [],
      progress: this.calculateProgress(updatedProject),
      timeRemaining: this.calculateTimeRemaining(updatedProject),
      isOverdue: this.isProjectOverdue(updatedProject),
    };
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });
  }

  async completeProject(userId: string, projectId: string): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETED',
        actualEndDate: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create completion notification
    try {
      await NotificationService.createProjectCompletionNotification(userId, project.title);
    } catch (error) {
      logger.error('Failed to create completion notification', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    return updatedProject;
  }

  async updateProjectStatus(userId: string, projectId: string, status: ProjectStatus): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set actual end date when completing
    if (status === 'COMPLETED' && !project.actualEndDate) {
      updateData.actualEndDate = new Date();
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    // Create notifications based on status change
    try {
      if (status === 'COMPLETED') {
        await NotificationService.createProjectCompletionNotification(userId, project.title);
      } else if (status === 'IN_PROGRESS') {
        await NotificationService.createMilestoneNotification(userId, project.title, 'Project Started');
      }
    } catch (error) {
      logger.error('Failed to create status change notification', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    return updatedProject;
  }

  private calculateProgress(project: Project): number {
    if (project.status === 'COMPLETED') return 100;
    if (project.status === 'PLANNING') return 0;

    const now = new Date();
    const start = project.startDate;
    const target = project.targetEndDate;

    const totalTime = target.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();

    if (elapsedTime <= 0) return 0;
    if (elapsedTime >= totalTime) return 100;

    return Math.round((elapsedTime / totalTime) * 100);
  }

  private calculateTimeRemaining(project: Project): number {
    if (project.status === 'COMPLETED') return 0;

    const now = new Date();
    const target = new Date(project.targetEndDate);
    
    // Compare dates by setting time to midnight to avoid timezone issues
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
    const remaining = targetDate.getTime() - nowDate.getTime();
    return Math.ceil(remaining / (1000 * 60 * 60 * 24)); // Days remaining (can be negative for overdue)
  }

  private isProjectOverdue(project: Project): boolean {
    if (project.status === 'COMPLETED') return false;
    
    const now = new Date();
    const target = new Date(project.targetEndDate);
    
    // Compare dates by setting time to midnight to avoid timezone issues
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
    return nowDate > targetDate;
  }
}

export const projectService = new ProjectService();
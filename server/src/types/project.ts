import { Project } from '@prisma/client';

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';

export interface CreateProjectData {
  title: string;
  description: string;
  techStack: string | string[];
  startDate?: Date;
  targetEndDate: Date;
  status?: ProjectStatus;
  repositoryUrl?: string;
  liveUrl?: string;
  revenueTracking?: boolean;
  marketResearch?: string;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  techStack?: string | string[];
  startDate?: Date;
  targetEndDate?: Date;
  status?: ProjectStatus;
  repositoryUrl?: string;
  liveUrl?: string;
  revenueTracking?: boolean;
  marketResearch?: string;
}

export interface ProjectWithProgress extends Omit<Project, 'techStack'> {
  techStack: string[];
  progress: number;
  timeRemaining: number;
  isOverdue: boolean;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  sortBy?: 'createdAt' | 'targetEndDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}
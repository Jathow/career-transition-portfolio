import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { CreateProjectData, UpdateProjectData } from '../types/project';
import { validateCreateProject, validateUpdateProject } from '../utils/validation';

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class ProjectController {
  async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const validation = validateCreateProject(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      const projectData: CreateProjectData = {
        ...validation.data,
        targetEndDate: new Date(validation.data.targetEndDate),
        startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
      };

      const project = await projectService.createProject(userId, projectData);

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create project',
      });
    }
  }

  async getUserProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const projects = await projectService.getUserProjects(userId);

      res.json({
        success: true,
        data: projects,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch projects',
      });
    }
  }

  async getProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const project = await projectService.getProjectById(userId, id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found',
        });
      }

      res.json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch project',
      });
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const validation = validateUpdateProject(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      const updateData: UpdateProjectData = {
        ...validation.data,
      };

      // Convert date strings to Date objects if present
      if (validation.data.targetEndDate) {
        updateData.targetEndDate = new Date(validation.data.targetEndDate);
      }
      if (validation.data.startDate) {
        updateData.startDate = new Date(validation.data.startDate);
      }

      const project = await projectService.updateProject(userId, id, updateData);

      res.json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update project',
      });
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      await projectService.deleteProject(userId, id);

      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete project',
      });
    }
  }

  async completeProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const project = await projectService.completeProject(userId, id);

      res.json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to complete project',
      });
    }
  }

  async updateProjectStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const validStatuses = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'PAUSED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project status',
        });
      }

      const project = await projectService.updateProjectStatus(userId, id, status);

      res.json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update project status',
      });
    }
  }
}

export const projectController = new ProjectController();
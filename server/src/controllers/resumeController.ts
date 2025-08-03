import { Request, Response } from 'express';
import { ResumeService, ResumeContent } from '../services/resumeService';
import { logger } from '../utils/logger';

export class ResumeController {
  /**
   * Get all available resume templates
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      const templates = await ResumeService.getTemplates();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      logger.error('Error fetching resume templates:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TEMPLATES_FETCH_ERROR',
          message: 'Failed to fetch resume templates',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get a specific template by ID
   */
  static async getTemplateById(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const template = await ResumeService.getTemplateById(templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      logger.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TEMPLATE_FETCH_ERROR',
          message: 'Failed to fetch template',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const templates = await ResumeService.getTemplatesByCategory(category);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      logger.error('Error fetching templates by category:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TEMPLATES_CATEGORY_FETCH_ERROR',
          message: 'Failed to fetch templates by category',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Create a new resume
   */
  static async createResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { versionName, templateId, content, isDefault } = req.body;

      // Validate required fields
      if (!versionName || !templateId || !content) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'versionName, templateId, and content are required',
            timestamp: new Date().toISOString()
          }
        });
      }

      const resume = await ResumeService.createResume(
        userId,
        versionName,
        templateId,
        content,
        isDefault
      );

      res.status(201).json({
        success: true,
        data: resume
      });
    } catch (error) {
      logger.error('Error creating resume:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RESUME_CREATE_ERROR',
          message: 'Failed to create resume',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get all resumes for the authenticated user
   */
  static async getUserResumes(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const resumes = await ResumeService.getUserResumes(userId);

      res.json({
        success: true,
        data: resumes
      });
    } catch (error) {
      logger.error('Error fetching user resumes:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RESUMES_FETCH_ERROR',
          message: 'Failed to fetch resumes',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get a specific resume by ID
   */
  static async getResumeById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { resumeId } = req.params;

      const resume = await ResumeService.getResumeById(resumeId, userId);

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESUME_NOT_FOUND',
            message: 'Resume not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      logger.error('Error fetching resume:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RESUME_FETCH_ERROR',
          message: 'Failed to fetch resume',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Update an existing resume
   */
  static async updateResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { resumeId } = req.params;
      const updates = req.body;

      const resume = await ResumeService.updateResume(resumeId, userId, updates);

      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      logger.error('Error updating resume:', error);
      
      if (error instanceof Error && error.message === 'Resume not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESUME_NOT_FOUND',
            message: 'Resume not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'RESUME_UPDATE_ERROR',
          message: 'Failed to update resume',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Delete a resume
   */
  static async deleteResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { resumeId } = req.params;

      await ResumeService.deleteResume(resumeId, userId);

      res.json({
        success: true,
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting resume:', error);
      
      if (error instanceof Error && error.message === 'Resume not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESUME_NOT_FOUND',
            message: 'Resume not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'RESUME_DELETE_ERROR',
          message: 'Failed to delete resume',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Set a resume as default
   */
  static async setDefaultResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { resumeId } = req.params;

      const resume = await ResumeService.setDefaultResume(resumeId, userId);

      res.json({
        success: true,
        data: resume,
        message: 'Resume set as default successfully'
      });
    } catch (error) {
      logger.error('Error setting default resume:', error);
      
      if (error instanceof Error && error.message === 'Resume not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESUME_NOT_FOUND',
            message: 'Resume not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'DEFAULT_RESUME_ERROR',
          message: 'Failed to set default resume',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Get default resume for user
   */
  static async getDefaultResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const resume = await ResumeService.getDefaultResume(userId);

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NO_DEFAULT_RESUME',
            message: 'No default resume found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      logger.error('Error fetching default resume:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DEFAULT_RESUME_FETCH_ERROR',
          message: 'Failed to fetch default resume',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Generate resume content from user data and projects
   */
  static async generateResumeContent(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const content = await ResumeService.generateResumeContent(userId);

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      logger.error('Error generating resume content:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RESUME_CONTENT_GENERATION_ERROR',
          message: 'Failed to generate resume content',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Export resume to different formats
   */
  static async exportResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { resumeId } = req.params;
      const { format } = req.query;

      if (!format || !['pdf', 'docx', 'txt'].includes(format as string)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EXPORT_FORMAT',
            message: 'Export format must be pdf, docx, or txt',
            timestamp: new Date().toISOString()
          }
        });
      }

      const exportContent = await ResumeService.exportResume(
        resumeId,
        userId,
        format as 'pdf' | 'docx' | 'txt'
      );

      // Set appropriate headers for download
      const filename = `resume-${resumeId}.${format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (format === 'docx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        res.setHeader('Content-Type', 'text/plain');
      }

      res.send(exportContent);
    } catch (error) {
      logger.error('Error exporting resume:', error);
      
      if (error instanceof Error && error.message === 'Resume not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESUME_NOT_FOUND',
            message: 'Resume not found',
            timestamp: new Date().toISOString()
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'RESUME_EXPORT_ERROR',
          message: 'Failed to export resume',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
} 
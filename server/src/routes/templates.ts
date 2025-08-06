import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { templateImportService } from '../services/templateImportService';
import fs from 'fs';
import path from 'path';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const router = Router();

// Import template data
router.post('/import-template', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { templateId, importSections, customProjectName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' }
      });
    }

    if (!templateId || !importSections || !Array.isArray(importSections)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid request: templateId and importSections array required' }
      });
    }

    logger.info('Template import requested', {
      userId,
      templateId,
      importSections,
      customProjectName,
      timestamp: new Date().toISOString()
    });

    // Use the template import service to handle the actual import
    const result = await templateImportService.importTemplate({
      userId,
      templateId,
      importSections,
      customProjectName
    });

    if (result.success) {
      res.json({
        success: true,
        data: {
          message: result.message,
          templateId,
          importedSections: result.importedSections,
          projectId: result.projectId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: { 
          message: result.message,
          details: result.errors 
        }
      });
    }

  } catch (error) {
    logger.error('Template import failed', { error, userId: (req as AuthenticatedRequest).user?.id });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to import template' }
    });
  }
});

// Get available templates
router.get('/available', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const templates = [
      {
        id: 'career-portfolio-platform',
        title: 'Career Portfolio Platform',
        description: 'A comprehensive full-stack web application example',
        category: 'Full-Stack Development',
        duration: '6 days',
        technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
        downloadUrl: '/templates/career-portfolio-platform-project.json',
        featured: true
      },
      {
        id: 'ecommerce-app',
        title: 'E-commerce Mobile App',
        description: 'Mobile-first e-commerce application with payment integration',
        category: 'Mobile Development',
        duration: '8 weeks',
        technologies: ['React Native', 'Node.js', 'MongoDB', 'Stripe'],
        downloadUrl: null,
        featured: false,
        comingSoon: true
      },
      {
        id: 'data-dashboard',
        title: 'Data Analytics Dashboard',
        description: 'Analytics dashboard with data visualization and reporting',
        category: 'Data Visualization',
        duration: '6 weeks',
        technologies: ['Python', 'Django', 'PostgreSQL', 'D3.js'],
        downloadUrl: null,
        featured: false,
        comingSoon: true
      }
    ];

    res.json({
      success: true,
      data: { templates }
    });

  } catch (error) {
    logger.error('Failed to fetch templates', { error });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch templates' }
    });
  }
});

// Download template file
router.get('/download/:templateId', (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    if (templateId === 'career-portfolio-platform') {
      const templatePath = path.join(__dirname, '../../career-portfolio-platform-project.json');
      
      if (fs.existsSync(templatePath)) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="career-portfolio-platform-project.json"');
        
        const templateData = fs.readFileSync(templatePath);
        res.send(templateData);
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Template file not found' }
        });
      }
    } else {
      res.status(404).json({
        success: false,
        error: { message: 'Template not found' }
      });
    }

  } catch (error) {
    logger.error('Template download failed', { error, templateId: req.params.templateId });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to download template' }
    });
  }
});

export { router as templateRoutes };
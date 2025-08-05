import { Router } from 'express';
import { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = Router();

// Import template data
router.post('/import-template', auth, async (req: Request, res: Response) => {
  try {
    const { templateId, importSections } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' }
      });
    }

    // Load template data
    const templatePath = path.join(__dirname, '../../career-portfolio-platform-project.json');
    
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        error: { message: 'Template not found' }
      });
    }

    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

    // In a real implementation, you would save this to your database
    // For now, we'll just simulate the import process
    
    logger.info('Template import requested', {
      userId,
      templateId,
      importSections,
      timestamp: new Date().toISOString()
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    /*
    // Real implementation would look like this:
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Create the project
    const project = await prisma.project.create({
      data: {
        ...templateData.project,
        userId: userId,
        isTemplate: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Import selected sections
    if (importSections.includes('resume')) {
      await prisma.resumeEntry.create({
        data: {
          ...templateData.resume.projectEntry,
          userId: userId,
          projectId: project.id
        }
      });
    }

    if (importSections.includes('portfolio')) {
      await prisma.portfolioItem.create({
        data: {
          ...templateData.portfolio.showcase,
          userId: userId,
          projectId: project.id
        }
      });
    }

    if (importSections.includes('market')) {
      await prisma.marketAnalysis.create({
        data: {
          ...templateData.revenueAndMarket,
          userId: userId,
          projectId: project.id
        }
      });
    }

    if (importSections.includes('motivation')) {
      await prisma.motivationLog.createMany({
        data: templateData.motivation.dailyLogs.map(log => ({
          ...log,
          userId: userId,
          projectId: project.id,
          createdAt: new Date(log.date)
        }))
      });
    }
    */

    res.json({
      success: true,
      data: {
        message: 'Template imported successfully',
        templateId,
        importedSections: importSections,
        projectId: 'demo-project-id' // In real implementation, this would be the actual project ID
      }
    });

  } catch (error) {
    logger.error('Template import failed', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to import template' }
    });
  }
});

// Get available templates
router.get('/available', auth, async (req: Request, res: Response) => {
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
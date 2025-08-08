import { Router } from 'express';
import { ResumeController } from '../controllers/resumeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all resume routes
router.use(authenticateToken);

// Template routes
router.get('/templates', ResumeController.getTemplates);
router.get('/templates/category/:category', ResumeController.getTemplatesByCategory);
router.get('/templates/:templateId', ResumeController.getTemplateById);

// Resume CRUD routes
router.post('/', ResumeController.createResume);
router.get('/', ResumeController.getUserResumes);
router.get('/default', ResumeController.getDefaultResume);
router.get('/:resumeId', ResumeController.getResumeById);
router.put('/:resumeId', ResumeController.updateResume);
router.delete('/:resumeId', ResumeController.deleteResume);

// Resume management routes
router.post('/:resumeId/default', ResumeController.setDefaultResume);

// Content generation route
router.get('/generate/content', ResumeController.generateResumeContent);
// Export route removed

export default router; 
import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD routes
router.post('/', projectController.createProject.bind(projectController));
router.get('/', projectController.getUserProjects.bind(projectController));
router.get('/:id', projectController.getProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

// Project status management
router.post('/:id/complete', projectController.completeProject.bind(projectController));
router.patch('/:id/status', projectController.updateProjectStatus.bind(projectController));

export default router;
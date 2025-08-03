import { Router } from 'express';
import interviewController from '../controllers/interviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Interview CRUD operations
router.post('/', interviewController.createInterview);
router.get('/', interviewController.getUserInterviews);
router.get('/upcoming', interviewController.getUpcomingInterviews);
router.get('/stats', interviewController.getInterviewStats);
router.get('/:id', interviewController.getInterviewById);
router.put('/:id', interviewController.updateInterview);
router.delete('/:id', interviewController.deleteInterview);

// Interview-specific operations
router.post('/:id/questions', interviewController.addInterviewQuestions);
router.post('/:id/feedback', interviewController.addInterviewFeedback);
router.put('/:id/outcome', interviewController.updateInterviewOutcome);

// Preparation materials
router.get('/preparation/:companyName', interviewController.getPreparationMaterials);

export default router; 
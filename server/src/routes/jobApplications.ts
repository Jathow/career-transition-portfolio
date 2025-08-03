import { Router } from 'express';
import jobApplicationController from '../controllers/jobApplicationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new job application
router.post('/', jobApplicationController.createApplication);

// Get all applications for the authenticated user
router.get('/', jobApplicationController.getUserApplications);

// Get applications that need follow-up
router.get('/follow-up', jobApplicationController.getApplicationsNeedingFollowUp);

// Get application analytics
router.get('/analytics', jobApplicationController.getApplicationAnalytics);

// Get a single application by ID
router.get('/:id', jobApplicationController.getApplicationById);

// Update an application
router.put('/:id', jobApplicationController.updateApplication);

// Update application status
router.patch('/:id/status', jobApplicationController.updateApplicationStatus);

// Add notes to an application
router.post('/:id/notes', jobApplicationController.addApplicationNotes);

// Delete an application
router.delete('/:id', jobApplicationController.deleteApplication);

export default router; 
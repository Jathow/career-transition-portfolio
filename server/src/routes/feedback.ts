import { Router } from 'express';
import { submitFeedback } from '../controllers/feedbackController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Allow both authenticated and anonymous feedback. If token present, capture userId.
router.post('/', authenticateToken as any, submitFeedback);

export default router;



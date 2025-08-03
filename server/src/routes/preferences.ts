import express from 'express';
import { getUserPreferences, updateUserPreferences } from '../controllers/preferencesController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All preferences routes require authentication
router.use(authenticateToken);

// Get user preferences
router.get('/', getUserPreferences);

// Update user preferences
router.put('/', updateUserPreferences);

export default router; 
import { Router } from 'express';
import { MotivationController } from '../controllers/motivationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/motivation/daily-log
 * @desc Log daily activity
 * @access Private
 */
router.post('/daily-log', authenticateToken, MotivationController.logDailyActivity);

/**
 * @route GET /api/motivation/daily-logs
 * @desc Get daily logs for a date range
 * @access Private
 */
router.get('/daily-logs', authenticateToken, MotivationController.getDailyLogs);

/**
 * @route POST /api/motivation/goals
 * @desc Create a new goal
 * @access Private
 */
router.post('/goals', authenticateToken, MotivationController.createGoal);

/**
 * @route GET /api/motivation/goals
 * @desc Get user's active goals
 * @access Private
 */
router.get('/goals', authenticateToken, MotivationController.getActiveGoals);

/**
 * @route GET /api/motivation/goals/:goalId
 * @desc Get a specific goal
 * @access Private
 */
router.get('/goals/:goalId', authenticateToken, MotivationController.getGoal);

/**
 * @route PUT /api/motivation/goals/:goalId/progress
 * @desc Update goal progress
 * @access Private
 */
router.put('/goals/:goalId/progress', authenticateToken, MotivationController.updateGoalProgress);

/**
 * @route DELETE /api/motivation/goals/:goalId
 * @desc Delete a goal
 * @access Private
 */
router.delete('/goals/:goalId', authenticateToken, MotivationController.deleteGoal);

/**
 * @route GET /api/motivation/achievements
 * @desc Get user's achievements
 * @access Private
 */
router.get('/achievements', authenticateToken, MotivationController.getAchievements);

/**
 * @route POST /api/motivation/achievements
 * @desc Create a custom achievement
 * @access Private
 */
router.post('/achievements', authenticateToken, MotivationController.createCustomAchievement);

/**
 * @route GET /api/motivation/feedback
 * @desc Get unread motivational feedback
 * @access Private
 */
router.get('/feedback', authenticateToken, MotivationController.getUnreadMotivationalFeedback);

/**
 * @route PATCH /api/motivation/feedback/:feedbackId/read
 * @desc Mark motivational feedback as read
 * @access Private
 */
router.patch('/feedback/:feedbackId/read', authenticateToken, MotivationController.markFeedbackAsRead);

/**
 * @route GET /api/motivation/stats
 * @desc Get comprehensive progress statistics
 * @access Private
 */
router.get('/stats', authenticateToken, MotivationController.getProgressStats);

/**
 * @route GET /api/motivation/guidance
 * @desc Generate strategic guidance
 * @access Private
 */
router.get('/guidance', authenticateToken, MotivationController.generateStrategicGuidance);

/**
 * @route GET /api/motivation/dashboard
 * @desc Get user's overall motivation dashboard data
 * @access Private
 */
router.get('/dashboard', authenticateToken, MotivationController.getMotivationDashboard);

export default router; 
import { Router } from 'express';
import { NotificationService } from '../services/notificationService';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import Joi from 'joi';

const router = Router();

// Notification preferences validation schema
const notificationPreferencesSchema = Joi.object({
  emailEnabled: Joi.boolean().required(),
  emailAddress: Joi.string().email().optional(),
  deadlineReminderHours: Joi.array().items(Joi.number().min(1).max(168)).required(), // 1 hour to 1 week
  progressCheckInterval: Joi.number().min(1).max(168).required(), // 1 hour to 1 week
});

/**
 * @route GET /api/notifications
 * @desc Get user notifications with pagination
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { unreadOnly, limit = 20, offset = 0 } = req.query;

    const notifications = await NotificationService.getUserNotifications(userId, {
      unreadOnly: unreadOnly === 'true',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    const totalCount = await NotificationService.getNotificationCount(userId);
    const unreadCount = await NotificationService.getNotificationCount(userId, true);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total: totalCount,
          unread: unreadCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting notifications', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications',
    });
  }
});

/**
 * @route GET /api/notifications/stats
 * @desc Get notification statistics
 * @access Private
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const stats = await NotificationService.getNotificationStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting notification stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to get notification stats',
    });
  }
});

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await NotificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.error('Error marking notification as read', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

/**
 * @route PATCH /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Error marking all notifications as read', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
});

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await NotificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    logger.error('Error deleting notification', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

/**
 * @route POST /api/notifications/test
 * @desc Send a test notification (for development)
 * @access Private
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Create a test notification
    await NotificationService.createNotification(
      userId,
      'system',
      {
        message: 'This is a test notification from the Career Portfolio system',
        type: 'test',
      }
    );

    res.json({
      success: true,
      message: 'Test notification sent',
    });
  } catch (error) {
    logger.error('Error sending test notification', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
    });
  }
});

/**
 * @route GET /api/notifications/preferences
 * @desc Get user notification preferences
 * @access Private
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // In a real implementation, you'd fetch preferences from the database
    // For now, return default preferences
    const preferences = {
      emailEnabled: true,
      emailAddress: (req as any).user.email,
      deadlineReminderHours: [24, 12, 6, 1], // 24h, 12h, 6h, 1h before deadline
      progressCheckInterval: 24, // Check progress every 24 hours
    };

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error('Error getting notification preferences', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to get notification preferences',
    });
  }
});

/**
 * @route PUT /api/notifications/preferences
 * @desc Update user notification preferences
 * @access Private
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const preferences = req.body;

    // In a real implementation, you'd save preferences to the database
    // For now, just log the update
    logger.info('Updating notification preferences', { userId, preferences });

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: preferences,
    });
  } catch (error) {
    logger.error('Error updating notification preferences', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences',
    });
  }
});

export default router; 
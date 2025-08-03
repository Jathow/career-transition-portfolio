import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TimeTrackingService } from '../services/timeTrackingService';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

const router = Router();

/**
 * @route GET /api/time-tracking/projects/:projectId/progress
 * @desc Get progress for a specific project
 * @access Private
 */
router.get('/projects/:projectId/progress', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied',
      });
    }

    const progress = await TimeTrackingService.calculateProjectProgress(projectId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found',
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error getting project progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project progress',
    });
  }
});

/**
 * @route GET /api/time-tracking/projects/progress
 * @desc Get progress for all user's projects
 * @access Private
 */
router.get('/projects/progress', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const progress = await TimeTrackingService.getAllProjectsProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error getting all projects progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get projects progress',
    });
  }
});

/**
 * @route GET /api/time-tracking/deadlines
 * @desc Get deadline notifications
 * @access Private
 */
router.get('/deadlines', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const deadlines = await TimeTrackingService.getDeadlineNotifications(userId);

    res.json({
      success: true,
      data: deadlines,
    });
  } catch (error) {
    console.error('Error getting deadline notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deadline notifications',
    });
  }
});

/**
 * @route GET /api/time-tracking/timeline
 * @desc Get project timeline data for visualization
 * @access Private
 */
router.get('/timeline', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const timeline = await TimeTrackingService.getProjectTimeline(userId);

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.error('Error getting project timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project timeline',
    });
  }
});

/**
 * @route GET /api/time-tracking/stats
 * @desc Get user's overall progress statistics
 * @access Private
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const stats = await TimeTrackingService.getUserProgressStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting user progress stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user progress stats',
    });
  }
});

/**
 * @route POST /api/time-tracking/update-statuses
 * @desc Update project statuses based on deadlines (admin/automated endpoint)
 * @access Private
 */
router.post('/update-statuses', authenticateToken, async (req, res) => {
  try {
    await TimeTrackingService.updateProjectStatusByDeadline();

    res.json({
      success: true,
      message: 'Project statuses updated successfully',
    });
  } catch (error) {
    console.error('Error updating project statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project statuses',
    });
  }
});

export default router; 
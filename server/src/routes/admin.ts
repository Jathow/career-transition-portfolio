import express from 'express';
import {
  getSystemStats,
  getUsers,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
  getSystemLogs,
  getPerformanceMetrics,
} from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// All admin routes require admin role
router.use(requireAdmin);

// System monitoring routes
router.get('/system-stats', getSystemStats);
router.get('/performance-metrics', getPerformanceMetrics);
router.get('/system-logs', getSystemLogs);

// User management routes
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/delete', deleteUser);

export default router; 
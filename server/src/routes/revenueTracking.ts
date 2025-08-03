import { Router } from 'express';
import { RevenueTrackingController } from '../controllers/revenueTrackingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const revenueTrackingController = new RevenueTrackingController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Revenue Metrics CRUD routes
router.post('/projects/:projectId/revenue-metrics', revenueTrackingController.createRevenueMetric);
router.get('/projects/:projectId/revenue-metrics', revenueTrackingController.getProjectRevenueMetrics);
router.put('/revenue-metrics/:metricId', revenueTrackingController.updateRevenueMetric);
router.delete('/revenue-metrics/:metricId', revenueTrackingController.deleteRevenueMetric);

// Project Analytics routes
router.post('/projects/:projectId/analytics', revenueTrackingController.createProjectAnalytics);
router.get('/projects/:projectId/analytics', revenueTrackingController.getProjectAnalytics);

// Monetization Strategies CRUD routes
router.post('/projects/:projectId/monetization-strategies', revenueTrackingController.createMonetizationStrategy);
router.get('/projects/:projectId/monetization-strategies', revenueTrackingController.getProjectMonetizationStrategies);
router.put('/monetization-strategies/:strategyId', revenueTrackingController.updateMonetizationStrategy);
router.delete('/monetization-strategies/:strategyId', revenueTrackingController.deleteMonetizationStrategy);

// Analytics and reporting routes
router.get('/revenue-tracking/summary', revenueTrackingController.getRevenueTrackingSummary);
router.get('/projects/:projectId/revenue-analysis', revenueTrackingController.getProjectRevenueAnalysis);
router.get('/revenue-metrics', revenueTrackingController.getUserRevenueMetrics);
router.get('/monetization-strategies', revenueTrackingController.getUserMonetizationStrategies);

export default router; 
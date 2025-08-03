import { Router } from 'express';
import portfolioController from '../controllers/portfolioController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Portfolio management routes (authenticated)
router.post('/', authenticateToken, portfolioController.createOrUpdatePortfolio);
router.get('/', authenticateToken, portfolioController.getUserPortfolio);
router.post('/generate', authenticateToken, portfolioController.generatePortfolioContent);
router.put('/seo', authenticateToken, portfolioController.updatePortfolioSEO);
router.put('/visibility', authenticateToken, portfolioController.togglePortfolioVisibility);

// Portfolio assets routes (authenticated)
router.post('/assets', authenticateToken, portfolioController.addPortfolioAsset);
router.get('/assets/:portfolioId', authenticateToken, portfolioController.getPortfolioAssets);
router.delete('/assets/:assetId', authenticateToken, portfolioController.deletePortfolioAsset);

// Portfolio analytics routes (authenticated)
router.get('/analytics', authenticateToken, portfolioController.getPortfolioAnalytics);

// Public portfolio route (no authentication required)
router.get('/public/:userId', portfolioController.getPublicPortfolio);

export default router; 
import { Router } from 'express';
import { MarketAnalysisController } from '../controllers/marketAnalysisController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const marketAnalysisController = new MarketAnalysisController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Market Research CRUD routes
router.post('/projects/:projectId/market-research', marketAnalysisController.createMarketResearch);
router.get('/projects/:projectId/market-research', marketAnalysisController.getProjectMarketResearch);
router.get('/market-research/:researchId', marketAnalysisController.getMarketResearchById);
router.put('/market-research/:researchId', marketAnalysisController.updateMarketResearch);
router.delete('/market-research/:researchId', marketAnalysisController.deleteMarketResearch);

// Analytics and reporting routes
router.get('/market-research', marketAnalysisController.getUserMarketResearch);
router.get('/market-analysis/summary', marketAnalysisController.getMarketAnalysisSummary);
router.get('/projects/:projectId/competition-analysis', marketAnalysisController.getCompetitionAnalysis);
router.get('/projects/:projectId/opportunity-assessment', marketAnalysisController.getOpportunityAssessment);

export default router; 
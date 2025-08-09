import { Router } from 'express';
import { ingestEvent } from '../controllers/analyticsController';

const router = Router();

// Privacy-friendly analytics ingest (no PII, config-gated)
router.post('/ingest', ingestEvent);

export default router;



import { Router } from 'express';
import { getFlags } from '../controllers/flagsController';

const router = Router();

router.get('/', getFlags);

export default router;



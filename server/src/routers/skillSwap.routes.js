import express from 'express';
import { authenticate, requireVerification } from '../middleware/authenticate.js';
import { requestSkillSwap, respondSkillSwap } from '../controllers/skillSwap.controller.js';

const router = express.Router();

router.post('/request', authenticate, requireVerification, requestSkillSwap);
router.patch('/:id/respond', authenticate, requireVerification, respondSkillSwap);

export default router;

import express from 'express';
import { authenticate, requireVerification } from '../middleware/authenticate.js';
import { getDashboardData } from '../controllers/dashboard.controller.js';

const router = express.Router();

// All dashboard data requires authenticated & verified user
router.get('/', authenticate, requireVerification, getDashboardData);

export default router;
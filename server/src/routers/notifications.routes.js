import express from 'express';
import { authenticate, requireVerification } from '../middleware/authenticate.js';
import { getMyNotifications, markNotificationRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', authenticate, requireVerification, getMyNotifications);
router.patch('/:id/read', authenticate, requireVerification, markNotificationRead);

export default router;

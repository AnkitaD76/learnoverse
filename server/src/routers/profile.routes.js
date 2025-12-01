import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getProfile, getMyProfile, updateProfile, deleteProfile } from '../controllers/profile.controller.js';

const router = express.Router();

// Public route - view any user's profile
router.get('/:userId', getProfile);

// Protected routes - user's own profile
router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateProfile);
router.delete('/me', authenticate, deleteProfile);

export default router;

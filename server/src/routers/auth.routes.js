import express from 'express';
import {
    register,
    verifyEmail,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    updatePassword,
    getActiveSessions,
    revokeAllSessions,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.get('/me', getCurrentUser);
router.post('/logout', logout);
router.patch('/update-password', updatePassword);
router.get('/sessions', getActiveSessions);
router.post('/revoke-all-sessions', revokeAllSessions);

export default router;

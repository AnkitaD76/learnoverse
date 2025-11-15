import express from 'express';
import {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    refreshAccessToken,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;

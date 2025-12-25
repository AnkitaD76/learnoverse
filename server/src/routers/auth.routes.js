import express from 'express';
import {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
} from '../controllers/auth.controller.js';

const router = express.Router();

// REGISTER
router.post('/register', register);

// LOGIN
router.post('/login', login);

// LOGOUT
router.post('/logout', logout);

// VERIFY EMAIL
router.post('/verify-email', verifyEmail);

// FORGOT PASSWORD
router.post('/forgot-password', forgotPassword);

// RESET PASSWORD
router.post('/reset-password', resetPassword);
export default router;

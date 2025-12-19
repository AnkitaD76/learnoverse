import express from 'express';
import {
    register,
    login,
    verifyEmail,
    forgotPassword,
} from '../controllers/auth.controller.js';

const router = express.Router();

// REGISTER
router.post('/register', register);

// LOGIN
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// VERIFY EMAIL
router.post('/verify-email', verifyEmail);

export default router;

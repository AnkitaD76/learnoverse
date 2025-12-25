import express from 'express';
import {
    getCertificate,
    generateCertificatePDF,
    getMyCertificates,
} from '../controllers/certificate.controller.js';
import rateLimit from 'express-rate-limit';
import {
    authenticate,
    requireVerification,
} from '../middleware/authenticate.js';

const router = express.Router();

// In-memory rate limiting for PDF generation
const pdfLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per IP per 15 minutes
    message: 'Too many PDF generation requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Protected route - get all my certificates
router.get(
    '/my-certificates',
    authenticate,
    requireVerification,
    getMyCertificates
);

// Public routes - no authentication required
router.get('/:certificateId', getCertificate);
router.post('/:certificateId/pdf', pdfLimiter, generateCertificatePDF);

export default router;

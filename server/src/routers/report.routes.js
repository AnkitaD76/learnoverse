import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorization.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
    createReportSchema,
    updateReportSchema,
    getReportsSchema,
    getUserReportsSchema,
} from '../validations/report.validation.js';

import {
    createReport,
    getMyReports,
    getAllReports,
    getReportById,
    dismissReport,
    takeActionOnReport,
    markReporterAsSpam,
    getReportStats,
} from '../controllers/report.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== User Routes ====================

/**
 * @route   POST /api/v1/reports
 * @desc    Create a new report
 * @access  Private (Any authenticated user)
 */
router.post('/', validateRequest(createReportSchema), createReport);

/**
 * @route   GET /api/v1/reports/my-reports
 * @desc    Get current user's reports
 * @access  Private (Any authenticated user)
 */
router.get(
    '/my-reports',
    validateRequest(getUserReportsSchema, 'query'),
    getMyReports
);

// ==================== Admin Routes ====================

/**
 * @route   GET /api/v1/reports/admin/all
 * @desc    Get all reports with filters
 * @access  Private/Admin
 */
router.get(
    '/admin/all',
    authorizeRoles('admin'),
    validateRequest(getReportsSchema, 'query'),
    getAllReports
);

/**
 * @route   GET /api/v1/reports/admin/stats
 * @desc    Get report statistics
 * @access  Private/Admin
 */
router.get('/admin/stats', authorizeRoles('admin'), getReportStats);

/**
 * @route   GET /api/v1/reports/admin/:id
 * @desc    Get single report details
 * @access  Private/Admin
 */
router.get('/admin/:id', authorizeRoles('admin'), getReportById);

/**
 * @route   PATCH /api/v1/reports/admin/:id/dismiss
 * @desc    Dismiss a report
 * @access  Private/Admin
 */
router.patch('/admin/:id/dismiss', authorizeRoles('admin'), dismissReport);

/**
 * @route   PATCH /api/v1/reports/admin/:id/action
 * @desc    Take action on report (delete content/ban user)
 * @access  Private/Admin
 */
router.patch('/admin/:id/action', authorizeRoles('admin'), takeActionOnReport);

/**
 * @route   PATCH /api/v1/reports/admin/mark-spam/:reporterId
 * @desc    Mark a reporter as spam
 * @access  Private/Admin
 */
router.patch(
    '/admin/mark-spam/:reporterId',
    authorizeRoles('admin'),
    markReporterAsSpam
);

export default router;

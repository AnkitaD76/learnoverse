import express from 'express';
import { fileShareUpload } from '../middleware/fileShareUpload.js';
import { authenticate } from '../middleware/authenticate.js';
import * as fileShareController from '../controllers/fileShare.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/file-share/upload
 * Upload a file
 */
router.post('/upload', fileShareUpload.single('file'), fileShareController.uploadFile);

/**
 * GET /api/v1/file-share
 * Get all files in a course
 * Query params: courseId
 */
router.get('/', fileShareController.getFiles);

/**
 * GET /api/v1/file-share/:fileId
 * Get file details
 */
router.get('/:fileId', fileShareController.getFileDetails);

/**
 * GET /api/v1/file-share/:fileId/download
 * Download a file
 */
router.get('/:fileId/download', fileShareController.downloadFile);

/**
 * PATCH /api/v1/file-share/:fileId/share
 * Share file with users
 */
router.patch('/:fileId/share', fileShareController.shareFile);

/**
 * DELETE /api/v1/file-share/:fileId
 * Delete a file
 */
router.delete('/:fileId', fileShareController.deleteFile);

export default router;

import express from 'express';
import { tempImageUpload } from '../middleware/tempImageUpload.js';
import { authenticate } from '../middleware/authenticate.js';
import * as tempImageController from '../controllers/tempImage.controller.js';

const router = express.Router();

/**
 * POST /api/v1/temp-images/upload
 * Upload temporary image (requires auth)
 */
router.post(
  '/upload',
  authenticate,
  tempImageUpload.single('image'),
  (err, req, res, next) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      return res.status(400).json({ 
        message: 'Image upload failed: ' + err.message 
      });
    }
    next();
  },
  tempImageController.uploadTempImage
);

/**
 * GET /api/v1/temp-images/:imageId
 * Download temporary image (public - no auth needed)
 */
router.get('/:imageId', tempImageController.getTempImage);

/**
 * GET /api/v1/temp-images/:imageId/info
 * Get image metadata (requires auth)
 */
router.get('/:imageId/info', authenticate, tempImageController.getTempImageInfo);

/**
 * DELETE /api/v1/temp-images/:imageId
 * Delete temporary image (requires auth)
 */
router.delete('/:imageId', authenticate, tempImageController.deleteTempImage);

/**
 * GET /api/v1/temp-images/stats
 * Get temporary images statistics (admin only)
 */
router.get('/stats/all', authenticate, tempImageController.getTempImageStats);

export default router;

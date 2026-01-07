import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../middleware/async-handler.js';

// Store temporary images in memory with expiration
// Format: { imageId: { data: Buffer, mimetype: string, createdAt: Date } }
const tempImageStore = new Map();

// Auto-cleanup old images (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  for (const [imageId, imageData] of tempImageStore.entries()) {
    if (now - imageData.createdAt > ONE_HOUR) {
      tempImageStore.delete(imageId);
      console.log(`🗑️  Deleted expired temp image: ${imageId}`);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

/**
 * @desc Upload temporary image for chat
 * @route POST /api/v1/temp-images/upload
 * @access Private
 * Images are stored in memory and deleted on server restart or after 1 hour
 */
export const uploadTempImage = asyncHandler(async (req, res) => {
  console.log('📥 uploadTempImage endpoint called');
  console.log('📋 Request details:', {
    hasFile: !!req.file,
    contentType: req.headers['content-type'],
    bodyKeys: Object.keys(req.body),
  });

  if (!req.file) {
    console.error('❌ No file in request - req.file is:', req.file);
    return res.status(400).json({ message: 'No image provided' });
  }

  console.log('✅ File received:', {
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  const imageId = uuidv4();

  // Store in memory
  tempImageStore.set(imageId, {
    data: req.file.buffer,
    mimetype: req.file.mimetype,
    originalName: req.file.originalname,
    size: req.file.size,
    createdAt: Date.now(),
  });

  const imageUrl = `/api/v1/temp-images/${imageId}`;

  res.status(201).json({
    success: true,
    message: 'Image uploaded temporarily',
    imageId,
    imageUrl,
    size: req.file.size,
  });
});

/**
 * @desc Get temporary image
 * @route GET /api/v1/temp-images/:imageId
 * @access Public
 */
export const getTempImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;

  const imageData = tempImageStore.get(imageId);

  if (!imageData) {
    return res.status(404).json({ message: 'Image not found or expired' });
  }

  // Set response headers
  res.setHeader('Content-Type', imageData.mimetype);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '0');

  // Send image buffer
  res.send(imageData.data);
});

/**
 * @desc Get temp image info (metadata)
 * @route GET /api/v1/temp-images/:imageId/info
 * @access Private
 */
export const getTempImageInfo = asyncHandler(async (req, res) => {
  const { imageId } = req.params;

  const imageData = tempImageStore.get(imageId);

  if (!imageData) {
    return res.status(404).json({ message: 'Image not found or expired' });
  }

  res.json({
    success: true,
    imageId,
    originalName: imageData.originalName,
    size: imageData.size,
    mimetype: imageData.mimetype,
    createdAt: new Date(imageData.createdAt),
    expiresIn: '1 hour',
  });
});

/**
 * @desc Delete temporary image (optional - user can clear it)
 * @route DELETE /api/v1/temp-images/:imageId
 * @access Private
 */
export const deleteTempImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;

  const deleted = tempImageStore.delete(imageId);

  if (!deleted) {
    return res.status(404).json({ message: 'Image not found or already expired' });
  }

  res.json({
    success: true,
    message: 'Temporary image deleted',
    imageId,
  });
});

/**
 * Get store size (for monitoring)
 */
export const getTempImageStats = asyncHandler(async (req, res) => {
  const stats = {
    totalImages: tempImageStore.size,
    images: Array.from(tempImageStore.entries()).map(([id, data]) => ({
      imageId: id,
      size: data.size,
      createdAt: new Date(data.createdAt),
      ageMinutes: Math.floor((Date.now() - data.createdAt) / 1000 / 60),
    })),
  };

  res.json(stats);
});

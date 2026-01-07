import multer from 'multer';
import path from 'path';

// Use memory storage for temporary images - they don't persist to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('🔍 Multer fileFilter called with:', {
    fileName: file.originalname,
    mimeType: file.mimetype,
  });

  // Only allow images
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File accepted');
    cb(null, true);
  } else {
    console.log('❌ File rejected - invalid type:', file.mimetype);
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
  }
};

export const tempImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for images
  },
});

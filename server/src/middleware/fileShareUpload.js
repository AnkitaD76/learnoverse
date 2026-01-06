import multer from 'multer';

// Use memory storage to store file in buffer
// This allows us to save directly to MongoDB without saving to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allowed file types for document sharing
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: PDF, Word, Excel, Text, CSV, JPEG, PNG, WebP`));
  }
};

export const fileShareUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

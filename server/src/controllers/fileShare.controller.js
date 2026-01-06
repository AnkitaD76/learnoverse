import { FileShare, Enrollment } from '../models/index.js';
import { asyncHandler } from '../middleware/async-handler.js';

/**
 * @desc Upload a file to course
 * @route POST /api/v1/file-share/upload
 * @access Private
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  const { courseId, visibility = 'course', description } = req.body;
  const userId = req.user._id || req.user.userId; // Handle both formats

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  // Create file share document
  const fileShare = await FileShare.create({
    uploadedBy: userId,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    fileData: req.file.buffer, // Store binary data directly
    courseId,
    visibility,
    description: description || '',
  });

  // Populate user info
  await fileShare.populate('uploadedBy', 'name avatar email');

  res.status(201).json({
    message: 'File uploaded successfully',
    file: {
      _id: fileShare._id,
      fileName: fileShare.fileName,
      fileSize: fileShare.fileSize,
      fileType: fileShare.fileType,
      uploadedBy: fileShare.uploadedBy,
      courseId: fileShare.courseId,
      visibility: fileShare.visibility,
      description: fileShare.description,
      downloads: fileShare.downloads,
      createdAt: fileShare.createdAt,
    },
  });
});

/**
 * @desc Get files in a course
 * @route GET /api/v1/file-share?courseId=xxx
 * @access Private
 */
export const getFiles = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  const userId = req.user._id || req.user.userId;

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  const files = await FileShare.find({
    courseId,
    $or: [
      { visibility: 'public' },
      { visibility: 'course' },
      { uploadedBy: userId },
      { sharedWith: userId },
    ],
  })
    .select('-fileData') // Don't send binary data in list
    .populate('uploadedBy', 'name avatar email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: files.length,
    files,
  });
});

/**
 * @desc Download a file
 * @route GET /api/v1/file-share/:fileId/download
 * @access Private
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user._id || req.user.userId;

  const file = await FileShare.findById(fileId);

  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Check if user is enrolled in the course
  let isEnrolled = false;
  if (file.visibility === 'course') {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: file.courseId,
    });
    isEnrolled = !!enrollment;
  }

  // Check access permissions
  const hasAccess =
    file.uploadedBy.toString() === userId.toString() ||
    file.visibility === 'public' ||
    (file.visibility === 'course' && isEnrolled) ||
    file.sharedWith.includes(userId);

  if (!hasAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Increment download counter
  file.downloads += 1;
  await file.save();

  // Send file as binary
  res.setHeader('Content-Type', file.fileType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
  res.send(file.fileData);
});

/**
 * @desc Share file with specific users
 * @route PATCH /api/v1/file-share/:fileId/share
 * @access Private (only owner)
 */
export const shareFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { userIds } = req.body;
  const userId = req.user._id || req.user.userId;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'User IDs array is required' });
  }

  const file = await FileShare.findById(fileId);

  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  if (file.uploadedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Only file owner can share' });
  }

  // Add users to sharedWith array (no duplicates)
  file.sharedWith = [...new Set([...file.sharedWith, ...userIds])];
  await file.save();

  await file.populate('uploadedBy', 'name avatar email');

  res.json({
    message: 'File shared successfully',
    file: {
      _id: file._id,
      fileName: file.fileName,
      sharedWith: file.sharedWith,
    },
  });
});

/**
 * @desc Delete a file
 * @route DELETE /api/v1/file-share/:fileId
 * @access Private (only owner)
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user._id || req.user.userId;

  const file = await FileShare.findById(fileId);

  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  if (file.uploadedBy.toString() !== userId.toString()) {
    return res.status(403).json({ message: 'Only file owner can delete' });
  }

  await FileShare.findByIdAndDelete(fileId);

  res.json({ message: 'File deleted successfully' });
});

/**
 * @desc Get file details (metadata only)
 * @route GET /api/v1/file-share/:fileId
 * @access Private
 */
export const getFileDetails = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await FileShare.findById(fileId)
    .select('-fileData')
    .populate('uploadedBy', 'name avatar email');

  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.json({
    success: true,
    file,
  });
});

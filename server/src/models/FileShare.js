import mongoose from 'mongoose';

const fileShareSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    fileType: {
      type: String, // MIME type: application/pdf, image/jpeg, etc.
      required: true,
    },
    fileData: {
      type: Buffer, // Binary file data stored in MongoDB
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'course', 'public'],
      default: 'course',
    },
    description: {
      type: String,
      maxlength: 500,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date, // Optional: auto-delete after this date
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
fileShareSchema.index({ courseId: 1, uploadedBy: 1 });
fileShareSchema.index({ expiresAt: 1 }, { sparse: true });

// Auto-delete expired files
fileShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.model('FileShare', fileShareSchema);

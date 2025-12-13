import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // receiver

    type: {
      type: String,
      enum: ['skill_swap_request', 'skill_swap_response', 'system'],
      default: 'system',
    },

    title: { type: String, default: '' },
    message: { type: String, default: '' },

    // flexible payload (skillSwapRequestId, courseId, etc.)
    data: { type: mongoose.Schema.Types.Mixed, default: {} },

    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);

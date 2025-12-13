import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['video', 'text', 'live'],
      required: true,
    },

    // video
    contentUrl: { type: String, default: '' },

    // text
    textContent: { type: String, default: '' },

    // live (Jitsi)
    live: {
      startTime: { type: Date, default: null },
      roomName: { type: String, default: '' }, // e.g. "learnoverse-course-123"
      joinCode: { type: String, default: '' }, // generated on create (only enrolled should receive)
    },

    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide course title'],
      trim: true,
    },
    description: { type: String, default: '' },
    category: { type: String, default: '', trim: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    pricePoints: { type: Number, default: 0, min: 0 },
    skillTags: { type: [String], default: [] },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    enrollCount: { type: Number, default: 0 },

    // ✅ Admin approval flow
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isPublished: {
      type: Boolean,
      default: false, // publish only after admin approves
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },

    // ✅ Option B: lessons are created with the course
    lessons: { type: [lessonSchema], default: [] },

    // ✅ skill swap flag per course
    skillSwapEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);

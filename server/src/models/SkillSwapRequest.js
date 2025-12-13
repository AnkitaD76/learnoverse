import mongoose from 'mongoose';

const skillSwapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    offeredCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    requestedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('SkillSwapRequest', skillSwapRequestSchema);

import mongoose from 'mongoose';

const skillSwapRequestSchema = new mongoose.Schema(
    {
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        offeredCourse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        requestedCourse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },

        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

// ✅ Indexes for search optimization
skillSwapRequestSchema.index({ status: 1 });
skillSwapRequestSchema.index({ fromUser: 1 });
skillSwapRequestSchema.index({ toUser: 1 });
skillSwapRequestSchema.index({ createdAt: -1 });

export default mongoose.model('SkillSwapRequest', skillSwapRequestSchema);

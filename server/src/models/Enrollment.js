import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },

        status: {
            type: String,
            enum: ['enrolled', 'withdrawn', 'refunded'],
            default: 'enrolled',
        },

        enrolledAt: { type: Date, default: Date.now },
        withdrawnAt: { type: Date, default: null },

        // Payment tracking
        paymentMethod: {
            type: String,
            enum: ['FREE', 'POINTS', 'SKILL_SWAP'],
            default: 'FREE',
        },
        pointsPaid: { type: Number, default: 0, min: 0 },

        // ✅ evaluation-based scoring
        totalScore: { type: Number, default: 0, min: 0 },

        // ✅ lesson progress tracking
        completedLessonIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
        },
    },
    { timestamps: true }
);
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);

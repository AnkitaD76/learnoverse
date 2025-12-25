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

        // ✅ coupon for live classes (generated on enroll)
        accessCode: { type: String, default: '' },

        // ✅ progress tracking
        completedLessonIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
        },

        // ✅ evaluation-based scoring
        totalScore: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);

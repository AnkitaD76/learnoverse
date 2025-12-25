import mongoose from 'mongoose';

/**
 * Evaluation Model
 * - Represents assignments and quizzes for courses
 * - Can only be created by course instructor
 * - Immutable after publishing
 */
const evaluationSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['assignment', 'quiz'],
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Evaluation title is required'],
            trim: true,
            minlength: 3,
            maxlength: 200,
        },
        description: {
            type: String,
            default: '',
            maxlength: 2000,
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 1,
            default: 100,
        },
        weight: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'closed'],
            default: 'draft',
            index: true,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        closedAt: {
            type: Date,
            default: null,
        },
        // Soft delete support
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Compound indexes for common queries
evaluationSchema.index({ course: 1, createdAt: -1 });
evaluationSchema.index({ instructor: 1, createdAt: -1 });
evaluationSchema.index({ course: 1, status: 1 });

// Store original document on init for comparison
evaluationSchema.post('init', function () {
    this._original = this.toObject();
});

// Prevent editing after publish
evaluationSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        // Check the ORIGINAL status (before any changes in this save operation)
        const originalStatus = this._original?.status || 'draft';

        // If transitioning from draft to published/closed, allow all changes
        if (originalStatus === 'draft') {
            return next();
        }

        // If evaluation WAS already published/closed, restrict changes
        if (originalStatus === 'published' || originalStatus === 'closed') {
            const modifiedPaths = this.modifiedPaths();
            const allowedAfterPublish = ['status', 'closedAt', 'publishedAt'];

            const illegalChanges = modifiedPaths.filter(
                path => !allowedAfterPublish.includes(path)
            );

            if (illegalChanges.length > 0) {
                const err = new Error(
                    'Cannot modify evaluation after publishing. Only status can be changed.'
                );
                err.name = 'ValidationError';
                return next(err);
            }
        }
    }
    next();
});

export default mongoose.model('Evaluation', evaluationSchema);

import mongoose from 'mongoose';

/**
 * EvaluationSubmission Model
 * - Student's submission for an evaluation
 * - ONE submission per student per evaluation
 * - Immutable after submission
 * - Grades are immutable after grading
 */
const evaluationSubmissionSchema = new mongoose.Schema(
    {
        evaluation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluation',
            required: true,
            index: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EvaluationQuestion',
                    required: true,
                },
                responseText: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 10000,
                },
            },
        ],
        submittedAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        totalScore: {
            type: Number,
            default: null,
            min: 0,
        },
        feedback: {
            type: String,
            default: null,
            maxlength: 5000,
        },
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        gradedAt: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['submitted', 'graded'],
            default: 'submitted',
            index: true,
        },
    },
    { timestamps: true }
);

// Unique constraint: one submission per student per evaluation
evaluationSubmissionSchema.index(
    { student: 1, evaluation: 1 },
    { unique: true }
);

// Index for queries
evaluationSubmissionSchema.index({ evaluation: 1, status: 1 });

// Prevent editing after submission
evaluationSubmissionSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        const modifiedPaths = this.modifiedPaths();
        const allowedAfterSubmit = [
            'totalScore',
            'feedback',
            'gradedBy',
            'gradedAt',
            'status',
        ];

        // If already submitted, only allow grading fields to be modified
        const illegalChanges = modifiedPaths.filter(
            path => !allowedAfterSubmit.includes(path)
        );

        if (illegalChanges.length > 0) {
            const err = new Error(
                'Cannot modify submission after submitting. Only grading fields can be updated.'
            );
            err.name = 'ValidationError';
            return next(err);
        }

        // If already graded, prevent changes to grade
        if (
            this.status === 'graded' &&
            (modifiedPaths.includes('totalScore') ||
                modifiedPaths.includes('feedback') ||
                modifiedPaths.includes('gradedBy') ||
                modifiedPaths.includes('gradedAt'))
        ) {
            const err = new Error('Cannot modify grade after grading.');
            err.name = 'ValidationError';
            return next(err);
        }
    }
    next();
});

export default mongoose.model(
    'EvaluationSubmission',
    evaluationSubmissionSchema
);

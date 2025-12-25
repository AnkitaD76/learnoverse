import mongoose from 'mongoose';

/**
 * EvaluationQuestion Model
 * - Written questions for evaluations (assignments/quizzes)
 * - Each question has a prompt and max marks
 */
const evaluationQuestionSchema = new mongoose.Schema(
    {
        evaluation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Evaluation',
            required: true,
            index: true,
        },
        prompt: {
            type: String,
            required: [true, 'Question prompt is required'],
            trim: true,
            minlength: 10,
            maxlength: 2000,
        },
        maxMarks: {
            type: Number,
            required: true,
            min: 1,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for efficient queries
evaluationQuestionSchema.index({ evaluation: 1, order: 1 });

export default mongoose.model('EvaluationQuestion', evaluationQuestionSchema);

import mongoose from 'mongoose';

/**
 * Answer Model
 * - Responses to questions
 * - Supports voting, edit history, acceptance
 */
const answerSchema = new mongoose.Schema(
    {
        body: {
            type: String,
            required: [true, 'Answer body is required'],
            minlength: 10,
            maxlength: 30000,
        },
        // Author of the answer
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Parent question
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
            index: true,
        },
        // Vote score (calculated from votes)
        voteScore: {
            type: Number,
            default: 0,
            index: true, // For sorting answers by votes
        },
        // Whether this is the accepted answer
        isAccepted: {
            type: Boolean,
            default: false,
            index: true, // For quickly finding accepted answer
        },
        // Basic edit history
        editHistory: [
            {
                editedAt: { type: Date, default: Date.now },
                previousBody: { type: String },
            },
        ],
        // Soft delete support
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Compound index for fetching answers for a question, sorted by votes
answerSchema.index({ question: 1, voteScore: -1 });
answerSchema.index({ question: 1, isAccepted: -1 }); // Accepted answer first

export default mongoose.model('Answer', answerSchema);

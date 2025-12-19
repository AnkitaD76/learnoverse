import mongoose from 'mongoose';

/**
 * Vote Model
 * - Polymorphic voting system for questions and answers
 * - Prevents duplicate votes per user
 * - Stores vote direction: +1 (upvote) or -1 (downvote)
 */
const voteSchema = new mongoose.Schema(
    {
        // User who cast the vote
        voter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Target type (question or answer)
        targetType: {
            type: String,
            required: true,
            enum: ['Question', 'Answer'],
        },
        // Target ID (question or answer ID)
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        // Vote value: +1 for upvote, -1 for downvote
        value: {
            type: Number,
            required: true,
            enum: [1, -1],
        },
    },
    { timestamps: true }
);

// Compound unique index to prevent duplicate votes
// One user can only vote once per target
voteSchema.index({ voter: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for fetching all votes on a target
voteSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.model('Vote', voteSchema);

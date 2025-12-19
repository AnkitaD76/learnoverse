import mongoose from 'mongoose';

/**
 * Question Model
 * - Main entity for Q&A system
 * - Supports tags, voting, accepted answers, view tracking
 */
const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Question title is required'],
            trim: true,
            minlength: 10,
            maxlength: 200,
        },
        body: {
            type: String,
            required: [true, 'Question body is required'],
            minlength: 20,
            maxlength: 30000,
        },
        // Author of the question
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Tags for categorization (many-to-many)
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tag',
            },
        ],
        // Vote score (calculated from votes)
        voteScore: {
            type: Number,
            default: 0,
            index: true, // For sorting by votes
        },
        // View count
        viewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Accepted answer (can only be one)
        acceptedAnswer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Answer',
            default: null,
        },
        // Track answer count for display
        answerCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Track last activity (for sorting by "active")
        lastActivityAt: {
            type: Date,
            default: Date.now,
            index: true,
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
questionSchema.index({ createdAt: -1 }); // Sort by newest
questionSchema.index({ voteScore: -1 }); // Sort by votes
questionSchema.index({ lastActivityAt: -1 }); // Sort by activity
questionSchema.index({ tags: 1, createdAt: -1 }); // Filter by tag + sort

// Text index for search
questionSchema.index({ title: 'text', body: 'text' });

// Update lastActivityAt on save
questionSchema.pre('save', function (next) {
    if (this.isModified('body') || this.isModified('title')) {
        this.lastActivityAt = new Date();
    }
    next();
});

export default mongoose.model('Question', questionSchema);

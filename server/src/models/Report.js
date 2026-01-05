import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        // Who reported
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reporter is required'],
        },

        // What is being reported
        reportType: {
            type: String,
            enum: ['course', 'post', 'user', 'liveSession', 'review'],
            required: [true, 'Report type is required'],
        },

        // Reference to the reported entity
        reportedEntity: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Reported entity is required'],
            refPath: 'reportType', // Dynamic reference based on reportType
        },

        // For user reports, store the reported user ID
        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        // Report category/reason
        category: {
            type: String,
            enum: [
                'inappropriate-content',
                'spam',
                'harassment',
                'scam',
                'copyright',
                'other',
            ],
            required: [true, 'Category is required'],
        },

        // User's description of the issue
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: 10,
            maxlength: 1000,
            trim: true,
        },

        // Report status
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'dismissed', 'action-taken'],
            default: 'pending',
        },

        // Admin who reviewed
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        // Admin's decision
        adminAction: {
            type: String,
            enum: ['none', 'dismissed', 'content-deleted', 'user-banned'],
            default: 'none',
        },

        // Admin notes
        adminNotes: {
            type: String,
            default: '',
            maxlength: 500,
        },

        // When reviewed
        reviewedAt: {
            type: Date,
            default: null,
        },

        // Flag spam reporters (if reporter submits too many dismissed reports)
        isSpamReport: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Indexes for efficient querying
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ reportedEntity: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ reportedUser: 1 });

// Virtual to get reported entity details (populated)
reportSchema.virtual('entityDetails', {
    refPath: 'reportType',
    localField: 'reportedEntity',
    foreignField: '_id',
    justOne: true,
});

// Method to mark as spam report
reportSchema.methods.markAsSpam = function () {
    this.isSpamReport = true;
    return this.save();
};

export default mongoose.model('Report', reportSchema);

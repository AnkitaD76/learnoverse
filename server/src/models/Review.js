import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        courseRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: function (value) {
                    // Allow whole numbers and half-stars (1, 1.5, 2, 2.5, etc.)
                    return value % 0.5 === 0;
                },
                message:
                    'Rating must be in increments of 0.5 (e.g., 1, 1.5, 2, etc.)',
            },
        },
        instructorRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: function (value) {
                    // Allow whole numbers and half-stars
                    return value % 0.5 === 0;
                },
                message:
                    'Rating must be in increments of 0.5 (e.g., 1, 1.5, 2, etc.)',
            },
        },
        reviewText: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: '',
        },
        helpfulCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        notHelpfulCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Track which users marked this review as helpful/not helpful
        helpfulBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        notHelpfulBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// Index for sorting by helpful count
reviewSchema.index({ helpfulCount: -1 });

// Index for sorting by date
reviewSchema.index({ createdAt: -1 });

// Virtual to calculate net helpful score
reviewSchema.virtual('netHelpfulScore').get(function () {
    return this.helpfulCount - this.notHelpfulCount;
});

// Ensure virtuals are included in JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;

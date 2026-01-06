import mongoose from 'mongoose';

/**
 * Tag Model
 * - Reusable tags for categorizing questions
 * - Tracks usage count for "popular tags" feature
 */
const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tag name is required'],
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 2,
            maxlength: 30,
            match: [
                /^[a-z0-9-]+$/,
                'Tag can only contain lowercase letters, numbers, and hyphens',
            ],
        },
        description: {
            type: String,
            default: '',
            maxlength: 200,
        },
        // Track how many questions use this tag
        questionCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// Index for fast lookups
tagSchema.index({ questionCount: -1 }); // For popular tags query

export default mongoose.model('Tag', tagSchema);

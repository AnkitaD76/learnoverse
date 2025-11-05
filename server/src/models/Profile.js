import mongoose from 'mongoose';

/**
 * Profile Model (Optional)
 *
 * This model can be used for extended user profile information
 * beyond authentication. Currently, demographics are in User model.
 * This can be used for additional features like:
 * - Learning preferences
 * - Social links
 * - Bio/About
 * - Achievements/Badges
 * - Course progress tracking
 */

const ProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            unique: true,
            index: true,
        },
        bio: {
            type: String,
            maxlength: 500,
            trim: true,
        },
        avatar: {
            type: String, // URL to avatar image
        },
        website: {
            type: String,
            trim: true,
        },
        socialLinks: {
            linkedin: String,
            twitter: String,
            github: String,
            facebook: String,
        },
        // Learning preferences
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'reading-writing'],
        },
        interests: [
            {
                type: String,
                trim: true,
            },
        ],
        // Education background (for students/instructors)
        education: [
            {
                institution: String,
                degree: String,
                fieldOfStudy: String,
                startYear: Number,
                endYear: Number,
                current: Boolean,
            },
        ],
        // Work experience (for instructors)
        experience: [
            {
                company: String,
                position: String,
                description: String,
                startDate: Date,
                endDate: Date,
                current: Boolean,
            },
        ],
        // Skills and expertise (for instructors)
        skills: [
            {
                type: String,
                trim: true,
            },
        ],
        // Certifications
        certifications: [
            {
                name: String,
                issuingOrganization: String,
                issueDate: Date,
                expiryDate: Date,
                credentialId: String,
                credentialUrl: String,
            },
        ],
        // Achievements (badges, awards, etc.)
        achievements: [
            {
                title: String,
                description: String,
                icon: String,
                earnedAt: Date,
            },
        ],
        // Privacy settings
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'private', 'connections-only'],
                default: 'public',
            },
            showEmail: {
                type: Boolean,
                default: false,
            },
            showLocation: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ProfileSchema.index({ user: 1 });

// Remove __v from JSON output
ProfileSchema.methods.toJSON = function () {
    const profile = this.toObject();
    delete profile.__v;
    return profile;
};

export default mongoose.model('Profile', ProfileSchema);

import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide name'],
            minlength: 2,
            maxlength: 100,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Please provide email'],
            validate: {
                validator: validator.isEmail,
                message: 'Please provide valid email',
            },
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide password'],
            minlength: 6,
        },
        role: {
            type: String,
            default: 'student',
            enum: ['admin', 'instructor', 'student', 'moderator'],
            trim: true,
            required: true,
        },

        // Demographics
        avatar: {
            type: String,
            default: null,
        },
        dateOfBirth: {
            type: Date,
            default: null,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say'],
            default: 'prefer-not-to-say',
        },
        phone: {
            type: String,
            default: null,
            validate: {
                validator: function (v) {
                    return v === null || validator.isMobilePhone(v);
                },
                message: 'Please provide a valid phone number',
            },
        },
        country: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        address: {
            type: String,
            maxlength: 500,
            default: null,
        },

        // Education Information
        educationLevel: {
            type: String,
            enum: [
                'high-school',
                'undergraduate',
                'graduate',
                'postgraduate',
                'doctorate',
                'other',
            ],
            default: null,
        },
        institution: {
            type: String,
            maxlength: 200,
            default: null,
        },
        fieldOfStudy: {
            type: String,
            maxlength: 100,
            default: null,
        },

        // Learning Preferences
        interests: {
            type: [String],
            default: [],
        },
        bio: {
            type: String,
            maxlength: 1000,
            default: null,
        },
        // Social links
        linkedin: {
            type: String,
            default: null,
            validate: {
                validator: function (v) {
                    if (v === null || v === '') return true;
                    return validator.isURL(v, {
                        protocols: ['http', 'https'],
                        require_protocol: true,
                    });
                },
                message: 'Please provide a valid URL for LinkedIn',
            },
        },
        website: {
            type: String,
            default: null,
            validate: {
                validator: function (v) {
                    if (v === null || v === '') return true;
                    return validator.isURL(v, {
                        protocols: ['http', 'https'],
                        require_protocol: true,
                    });
                },
                message: 'Please provide a valid website URL',
            },
        },
        github: {
            type: String,
            default: null,
            validate: {
                validator: function (v) {
                    if (v === null || v === '') return true;
                    return validator.isURL(v, {
                        protocols: ['http', 'https'],
                        require_protocol: true,
                    });
                },
                message: 'Please provide a valid GitHub profile URL',
            },
        },

        // Learning Progress
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
        completedCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],

        // Account Status
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        verificationTokenExpires: Date,

        passwordResetToken: String,
        passwordResetExpires: Date,

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLogin: {
            type: Date,
            default: null,
        },

        // Security
        passwordChangedAt: Date,

        // 🔸 Skill swap & points system
        skillsOffered: {
            type: [String],
            default: [],
        },
        skillsWanted: {
            type: [String],
            default: [],
        },
        pointsBalance: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Q&A System Reputation
        reputation: {
            type: Number,
            default: 0,
            min: 0,
            index: true, // For leaderboards
        },
    },
    { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }

    next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password changed after token
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

export default mongoose.model('User', UserSchema);

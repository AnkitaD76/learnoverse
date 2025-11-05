import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide name'],
            minlength: 2,
            maxlength: 50,
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
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: {
                values: ['admin', 'instructor', 'student'],
                message: '{VALUE} is not a valid role',
            },
            default: 'student',
        },
        // Demographic fields (optional)
        age: {
            type: Number,
            min: [13, 'Must be at least 13 years old'],
            max: [120, 'Invalid age'],
        },
        gender: {
            type: String,
            enum: {
                values: ['male', 'female', 'other', 'prefer-not-to-say'],
                message: '{VALUE} is not a valid gender option',
            },
        },
        location: {
            country: String,
            state: String,
            city: String,
        },
        occupation: {
            type: String,
            maxlength: 100,
            trim: true,
        },
        // Email verification
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            select: false,
        },
        verificationTokenExpiry: {
            type: Date,
            select: false,
        },
        verified: {
            type: Date,
        },
        // Password reset
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpiry: {
            type: Date,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
        },
        // Account status
        status: {
            type: String,
            enum: {
                values: ['active', 'inactive', 'suspended', 'deleted'],
                message: '{VALUE} is not a valid status',
            },
            default: 'active',
        },
        // Activity tracking
        lastActive: {
            type: Date,
            default: Date.now,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });

// Virtual for account locked status
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        // Set password changed timestamp
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000; // 1 second ago to ensure token is created after
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to check if password was changed after token was issued
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

// Method to increment login attempts
UserSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    // Otherwise increment
    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours

    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }

    return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};

// Static method to create verification token
UserSchema.methods.createVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
};

// Static method to create password reset token
UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.verificationToken;
    delete user.verificationTokenExpiry;
    delete user.passwordResetToken;
    delete user.passwordResetExpiry;
    delete user.__v;
    return user;
};

export default mongoose.model('User', UserSchema);

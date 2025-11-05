import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true,
        },
        token: {
            type: String,
            required: [true, 'Token is required'],
            unique: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiry date is required'],
            index: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
            index: true,
        },
        revokedAt: {
            type: Date,
        },
        replacedBy: {
            type: String, // Token that replaced this one (for rotation tracking)
        },
        // Device/session information
        userAgent: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
        device: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
RefreshTokenSchema.index({ user: 1, expiresAt: 1 });
RefreshTokenSchema.index({ user: 1, isRevoked: 1 });
RefreshTokenSchema.index({ token: 1, isRevoked: 1 });

// Automatically delete expired tokens after 30 days
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

// Static method to revoke all tokens for a user
RefreshTokenSchema.statics.revokeAllForUser = async function (userId) {
    try {
        const result = await this.updateMany(
            { user: userId, isRevoked: false },
            {
                $set: {
                    isRevoked: true,
                    revokedAt: new Date(),
                },
            }
        );
        return result;
    } catch (error) {
        console.error('Error revoking tokens for user:', error);
        throw error;
    }
};

// Static method to clean up expired and revoked tokens
RefreshTokenSchema.statics.cleanup = async function () {
    try {
        const result = await this.deleteMany({
            $or: [
                { expiresAt: { $lte: new Date() } },
                {
                    isRevoked: true,
                    revokedAt: {
                        $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                }, // Revoked > 7 days ago
            ],
        });

        if (result.deletedCount > 0) {
            console.log(
                `🧹 Cleaned up ${result.deletedCount} expired/revoked refresh tokens`
            );
        }

        return result;
    } catch (error) {
        console.error('Error cleaning up tokens:', error);
        throw error;
    }
};

// Static method to get active sessions for a user
RefreshTokenSchema.statics.getActiveSessions = async function (userId) {
    try {
        return await this.find({
            user: userId,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        })
            .select('userAgent ipAddress device createdAt')
            .sort({ createdAt: -1 });
    } catch (error) {
        console.error('Error getting active sessions:', error);
        throw error;
    }
};

// Instance method to revoke this token
RefreshTokenSchema.methods.revoke = async function () {
    this.isRevoked = true;
    this.revokedAt = new Date();
    await this.save();
};

// Check if token is valid
RefreshTokenSchema.methods.isValid = function () {
    return !this.isRevoked && this.expiresAt > new Date();
};

// Remove sensitive data from JSON output
RefreshTokenSchema.methods.toJSON = function () {
    const token = this.toObject();
    delete token.__v;
    // Optionally hide full token in responses
    if (token.token) {
        token.token = `${token.token.substring(0, 10)}...`;
    }
    return token;
};

export default mongoose.model('RefreshToken', RefreshTokenSchema);

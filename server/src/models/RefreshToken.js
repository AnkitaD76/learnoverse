import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true,
        },
        userAgent: {
            type: String,
            default: 'Unknown',
        },
        ip: {
            type: String,
            required: true,
        },
        isValid: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Add index for faster lookups
RefreshTokenSchema.index({ refreshToken: 1 });
RefreshTokenSchema.index({ user: 1 });

export default mongoose.model('RefreshToken', RefreshTokenSchema);

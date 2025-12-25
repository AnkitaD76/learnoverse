import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        certificateNumber: {
            type: String,
            required: false, // Generated in pre-save hook
        },
        issuedAt: {
            type: Date,
            default: Date.now,
            immutable: true,
        },
        status: {
            type: String,
            enum: ['issued', 'revoked'],
            default: 'issued',
        },
    },
    { timestamps: true }
);

// Unique compound index - one certificate per user per course
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

// Index for certificate number lookups
certificateSchema.index({ certificateNumber: 1 });

// Generate certificate number before save
certificateSchema.pre('save', function (next) {
    if (this.isNew && !this.certificateNumber) {
        // Format: LRN-YYYY-XXXXXXXX (LRN = Learnoverse)
        const year = new Date().getFullYear();
        const random = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();
        this.certificateNumber = `LRN-${year}-${random}`;
    }
    next();
});

export default mongoose.model('Certificate', certificateSchema);

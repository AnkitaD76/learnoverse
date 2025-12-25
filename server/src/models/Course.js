import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['video', 'text', 'live'],
            required: true,
        },

        // video
        contentUrl: { type: String, default: '' },

        // text
        textContent: { type: String, default: '' },

        // live (Jitsi)
        live: {
            startTime: { type: Date, default: null },
            roomName: { type: String, default: '' }, // e.g. "learnoverse-course-123"
            joinCode: { type: String, default: '' }, // generated on create (only enrolled should receive)
            // PID of a keepalive process (optional) that stays connected to the room
            keepalivePid: { type: Number, default: null },
        },

        order: { type: Number, default: 0 },
    },
    { _id: true }
);

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide course title'],
            trim: true,
        },
        description: { type: String, default: '' },
        category: { type: String, default: '', trim: true },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },
        pricePoints: { type: Number, default: 0, min: 0 },
        skillTags: { type: [String], default: [] },

        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        enrollCount: { type: Number, default: 0 },

        // ✅ Admin approval flow
        status: {
            type: String,
            enum: ['draft', 'pending', 'approved', 'rejected'],
            default: 'pending',
        },
        isPublished: {
            type: Boolean,
            default: false, // publish only after admin approves
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        publishedAt: { type: Date, default: null },
        rejectionReason: { type: String, default: '' },

        // ✅ Option B: lessons are created with the course
        lessons: { type: [lessonSchema], default: [] },

        // ✅ skill swap flag per course
        skillSwapEnabled: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ✅ Indexes for search optimization
courseSchema.index({ title: 'text', description: 'text', category: 'text' }); // Full-text search
courseSchema.index({ skillTags: 1 }); // Filter by skills
courseSchema.index({ pricePoints: 1 }); // Filter by price
courseSchema.index({ level: 1 }); // Filter by level
courseSchema.index({ instructor: 1 }); // Filter by instructor
courseSchema.index({ status: 1, isPublished: 1 }); // Filter by status
courseSchema.index({ enrollCount: -1 }); // Sort by popularity
courseSchema.index({ createdAt: -1 }); // Sort by newest

export default mongoose.model('Course', courseSchema);

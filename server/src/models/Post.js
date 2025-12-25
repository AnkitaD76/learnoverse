import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now },
});

// ✅ Indexes for search optimization
postSchema.index({ text: 'text' }); // Full-text search
postSchema.index({ createdAt: -1 }); // Sort by newest
postSchema.index({ user: 1 }); // Filter by user

export default mongoose.model('Post', postSchema);

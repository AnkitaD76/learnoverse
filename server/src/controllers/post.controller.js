import Post from '../models/Post.js';

export const createPost = async (req, res) => {
    try {
        const post = await Post.create({
            user: req.user.userId,
            text: req.body.text,
        });

        // Populate user data before sending response
        await post.populate('user', 'name email');

        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name email')
            .populate('comments.user', 'name email')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Toggle like: if already liked, unlike; otherwise, like
        const userIndex = post.likes.indexOf(req.user.userId);
        if (userIndex > -1) {
            // Unlike: remove user from likes array
            post.likes.splice(userIndex, 1);
        } else {
            // Like: add user to likes array
            post.likes.push(req.user.userId);
        }

        await post.save();

        // Populate user data before sending response
        await post.populate('user', 'name email');
        await post.populate('comments.user', 'name email');

        res.json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const commentPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        post.comments.push({ user: req.user.userId, text: req.body.text });
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

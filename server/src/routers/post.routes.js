import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
    commentPost,
    likePost,
    getPosts,
    createPost,
} from '../controllers/post.controller.js';

const router = express.Router();

// Create a post
router.post('/', authenticate, createPost);
// Get all posts
router.get('/', getPosts);
// Like a post
router.post('/:id/like', authenticate, likePost);
// Comment on a post
router.post('/:id/comment', authenticate, commentPost);

export default router;

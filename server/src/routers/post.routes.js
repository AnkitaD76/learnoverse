const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const postController = require('../controllers/post.controller');

// Create a post
router.post('/', authenticate, postController.createPost);
// Get all posts
router.get('/', postController.getPosts);
// Like a post
router.post('/:id/like', authenticate, postController.likePost);
// Comment on a post
router.post('/:id/comment', authenticate, postController.commentPost);

module.exports = router;

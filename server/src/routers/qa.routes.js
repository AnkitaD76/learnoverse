import express from 'express';
import {
    authenticate,
    requireVerification,
} from '../middleware/authenticate.js';

import {
    // Questions
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    // Answers
    getAnswers,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    acceptAnswer,
    unacceptAnswer,
    // Voting
    vote,
    // Tags
    getTags,
    getTagByName,
    // User stats
    getUserStats,
    getMyQuestions,
    getMyAnswers,
} from '../controllers/qa.controller.js';

const router = express.Router();

/**
 * ========================================
 * QUESTIONS ROUTES
 * ========================================
 */

// Public - Browse questions
router.get('/questions', getQuestions);

// Public - Get single question
router.get('/questions/:id', getQuestionById);

// Protected - Create question
router.post('/questions', authenticate, requireVerification, createQuestion);

// Protected - Update question
router.patch(
    '/questions/:id',
    authenticate,
    requireVerification,
    updateQuestion
);

// Protected - Delete question
router.delete(
    '/questions/:id',
    authenticate,
    requireVerification,
    deleteQuestion
);

/**
 * ========================================
 * ANSWERS ROUTES
 * ========================================
 */

// Public - Get answers for a question
router.get('/questions/:questionId/answers', getAnswers);

// Protected - Create answer
router.post(
    '/questions/:questionId/answers',
    authenticate,
    requireVerification,
    createAnswer
);

// Protected - Update answer
router.patch('/answers/:id', authenticate, requireVerification, updateAnswer);

// Protected - Delete answer
router.delete('/answers/:id', authenticate, requireVerification, deleteAnswer);

// Protected - Accept answer
router.post(
    '/answers/:id/accept',
    authenticate,
    requireVerification,
    acceptAnswer
);

// Protected - Unaccept answer
router.delete(
    '/answers/:id/accept',
    authenticate,
    requireVerification,
    unacceptAnswer
);

/**
 * ========================================
 * VOTING ROUTES
 * ========================================
 */

// Protected - Vote on question or answer
router.post('/vote', authenticate, requireVerification, vote);

/**
 * ========================================
 * TAGS ROUTES
 * ========================================
 */

// Public - Get all tags
router.get('/tags', getTags);

// Public - Get tag by name
router.get('/tags/:name', getTagByName);

/**
 * ========================================
 * USER STATS ROUTES
 * ========================================
 */

// Public - Get user's Q&A stats
router.get('/users/:userId/stats', getUserStats);

// Protected - Get my questions
router.get(
    '/users/me/questions',
    authenticate,
    requireVerification,
    getMyQuestions
);

// Protected - Get my answers
router.get(
    '/users/me/answers',
    authenticate,
    requireVerification,
    getMyAnswers
);

export default router;

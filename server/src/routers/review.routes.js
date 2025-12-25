import express from 'express';
import {
    createReview,
    updateReview,
    deleteReview,
    getCourseReviews,
    getUserReview,
    markReviewHelpful,
    adminDeleteReview,
    getRatingDistribution,
} from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorization.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
    createReviewSchema,
    updateReviewSchema,
    getCourseReviewsSchema,
    markReviewHelpfulSchema,
    getUserReviewSchema,
    deleteReviewSchema,
} from '../validations/review.validation.js';

const router = express.Router();

// Public routes
router.get(
    '/course/:courseId',
    validateRequest(getCourseReviewsSchema),
    getCourseReviews
);
router.get(
    '/course/:courseId/distribution',
    validateRequest(getUserReviewSchema), // Reuse schema (just needs courseId)
    getRatingDistribution
);

// Private routes (authenticated users)
router.post(
    '/',
    authenticate,
    validateRequest(createReviewSchema),
    createReview
);
router.patch(
    '/:id',
    authenticate,
    validateRequest(updateReviewSchema),
    updateReview
);
router.delete(
    '/:id',
    authenticate,
    validateRequest(deleteReviewSchema),
    deleteReview
);
router.get(
    '/my-review/:courseId',
    authenticate,
    validateRequest(getUserReviewSchema),
    getUserReview
);
router.patch(
    '/:id/helpful',
    authenticate,
    validateRequest(markReviewHelpfulSchema),
    markReviewHelpful
);

// Admin routes
router.delete(
    '/admin/:id',
    authenticate,
    authorizeRoles('admin'),
    validateRequest(deleteReviewSchema),
    adminDeleteReview
);

export default router;

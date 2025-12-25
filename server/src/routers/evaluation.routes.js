import express from 'express';
import {
    authenticate,
    requireVerification,
} from '../middleware/authenticate.js';
import {
    createEvaluation,
    updateEvaluation,
    publishEvaluation,
    closeEvaluation,
    getEvaluationById,
    getInstructorEvaluations,
    getEvaluationSubmissions,
    submitEvaluation,
    gradeSubmission,
    getMySubmission,
    getStudentEvaluations,
} from '../controllers/evaluation.controller.js';

const router = express.Router();

/**
 * Evaluation Routes
 * - Instructors create/manage evaluations
 * - Students view/submit evaluations
 * - Instructors grade submissions
 */

// Student routes - Get evaluations for a course
router.get(
    '/courses/:courseId/evaluations',
    authenticate,
    requireVerification,
    getStudentEvaluations
);

// Instructor routes - Get all evaluations with submission counts
router.get(
    '/courses/:courseId/evaluations/instructor',
    authenticate,
    requireVerification,
    getInstructorEvaluations
);

// Create evaluation for a course
router.post(
    '/courses/:courseId/evaluations',
    authenticate,
    requireVerification,
    createEvaluation
);

// Get evaluation details (instructor or enrolled student)
router.get(
    '/evaluations/:id',
    authenticate,
    requireVerification,
    getEvaluationById
);

// Update draft evaluation
router.put(
    '/evaluations/:id',
    authenticate,
    requireVerification,
    updateEvaluation
);

// Publish evaluation
router.post(
    '/evaluations/:id/publish',
    authenticate,
    requireVerification,
    publishEvaluation
);

// Close evaluation
router.post(
    '/evaluations/:id/close',
    authenticate,
    requireVerification,
    closeEvaluation
);

// Get submissions for an evaluation (instructor only)
router.get(
    '/evaluations/:id/submissions',
    authenticate,
    requireVerification,
    getEvaluationSubmissions
);

// Submit evaluation (student)
router.post(
    '/evaluations/:id/submit',
    authenticate,
    requireVerification,
    submitEvaluation
);

// Get my submission for an evaluation (student)
router.get(
    '/evaluations/:id/my-submission',
    authenticate,
    requireVerification,
    getMySubmission
);

// Grade a submission (instructor)
router.post(
    '/submissions/:id/grade',
    authenticate,
    requireVerification,
    gradeSubmission
);

export default router;

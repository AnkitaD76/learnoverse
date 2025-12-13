import express from 'express';
import { authenticate, requireVerification } from '../middleware/authenticate.js';
import {
  getCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  withdrawFromCourse,
  getMyEnrollments,
  getMyCreatedCourses,
} from '../controllers/course.controller.js';

const router = express.Router();

// Public browsing
router.get('/', getCourses);

// ✅ IMPORTANT: "me" routes must come BEFORE "/:id"
router.get(
  '/me/enrollments',
  authenticate,
  requireVerification,
  getMyEnrollments
);

router.get(
  '/me/created',
  authenticate,
  requireVerification,
  getMyCreatedCourses
);

// Protected actions
router.post('/', authenticate, requireVerification, createCourse);
router.post('/:id/enroll', authenticate, requireVerification, enrollInCourse);
router.post('/:id/withdraw', authenticate, requireVerification, withdrawFromCourse);

// Single course details (keep this LAST)
router.get('/:id', getCourseById);

export default router;

import express from 'express';
import { authenticate, requireVerification } from '../middleware/authenticate.js';
import {
  getCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  withdrawFromCourse,
  getMyEnrollments,
} from '../controllers/course.controller.js';

const router = express.Router();

// Public browsing
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected actions
router.post('/', authenticate, requireVerification, createCourse);
router.post('/:id/enroll', authenticate, requireVerification, enrollInCourse);
router.post('/:id/withdraw', authenticate, requireVerification, withdrawFromCourse);
router.get('/me/enrollments', authenticate, requireVerification, getMyEnrollments);

export default router;

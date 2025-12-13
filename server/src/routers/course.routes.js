import express from 'express';
import { authenticate, requireVerification } from '../middleware/authenticate.js';
import {
  getCourses,
  getCourseById,
  createCourse,
  deleteCourse,
  getCourseEnrollments,
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
router.delete('/:id', authenticate, requireVerification, deleteCourse);
router.get('/:id/enrollments', authenticate, requireVerification, getCourseEnrollments);
router.post('/:id/enroll', authenticate, requireVerification, enrollInCourse);
router.post('/:id/withdraw', authenticate, requireVerification, withdrawFromCourse);
router.get('/me/enrollments', authenticate, requireVerification, getMyEnrollments);

export default router;

import express from 'express';
import {
    authenticate,
    requireVerification,
} from '../middleware/authenticate.js';
import {
    getCourses,
    getCourseById,
    createCourse,
    enrollInCourse,
    enrollInCourseWithPoints,
    withdrawFromCourse,
    getMyEnrollments,
    getMyCreatedCourses,
    deleteCourse,
    getCourseEnrollments,
  addLessonToCourse,
  updateLessonInCourse,
  deleteLessonFromCourse,
  createLiveSessionInLesson,
    stopKeepaliveForLesson,
} from '../controllers/course.controller.js';

const router = express.Router();

/**
 * IMPORTANT:
 * Put specific routes BEFORE "/:id"
 * Otherwise "/me/enrollments" becomes id="me"
 */

// ✅ My courses (enrolled)
router.get(
    '/me/enrollments',
    authenticate,
    requireVerification,
    getMyEnrollments
);

// ✅ My created courses (instructor/admin)
router.get(
    '/me/created',
    authenticate,
    requireVerification,
    getMyCreatedCourses
);

// Public browsing
router.get('/', getCourses);

// Course details
router.get('/:id', getCourseById);

// Protected actions
router.post('/', authenticate, requireVerification, createCourse);
router.delete('/:id', authenticate, requireVerification, deleteCourse);
router.post('/:id/enroll', authenticate, requireVerification, enrollInCourse);
router.post('/:id/withdraw', authenticate, requireVerification, withdrawFromCourse);
router.get('/:id/enrollments', authenticate, requireVerification, getCourseEnrollments);

// Add lesson (instructor/admin)
router.post('/:id/lessons', authenticate, requireVerification, addLessonToCourse);
router.patch('/:id/lessons/:lessonId', authenticate, requireVerification, updateLessonInCourse);
router.delete('/:id/lessons/:lessonId', authenticate, requireVerification, deleteLessonFromCourse);
router.post('/:id/lessons/:lessonId/create-live', authenticate, requireVerification, createLiveSessionInLesson);
router.post('/:id/lessons/:lessonId/stop-keepalive', authenticate, requireVerification, stopKeepaliveForLesson);


export default router;

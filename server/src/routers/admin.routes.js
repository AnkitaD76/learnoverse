import express from 'express';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorization.js';

import {
  getAllUsers,
  getSingleUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserStats,
  getPendingCourses,
  approveCourse,
  rejectCourse,
} from '../controllers/admin.controller.js';



const router = express.Router();

// Admin-only
router.use(authenticate);
router.use(authorizeRoles('admin'));

// User admin
router.get('/stats', getUserStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Course approval
router.get('/courses/pending', getPendingCourses);
router.patch('/courses/:id/approve', approveCourse);
router.patch('/courses/:id/reject', rejectCourse);




export default router;

import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import authorizePermissions from '../utils/authorizePermissions.js';
import {
    getMyProfile,
    updateMyProfile,
    getAdminDashboard,
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getInstructorDashboard,
    getStudentDashboard,
} from '../controllers/user.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ===========================
// User Profile Routes
// ===========================
router.route('/me').get(getMyProfile).patch(updateMyProfile);

// ===========================
// Dashboard Routes
// ===========================
router.get('/student/dashboard', getStudentDashboard);

router.get(
    '/instructor/dashboard',
    authorizePermissions([{ resource: 'courses', action: 'create' }]),
    getInstructorDashboard
);

router.get(
    '/admin/dashboard',
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    getAdminDashboard
);

// ===========================
// Admin - User Management Routes
// ===========================
router.get(
    '/admin/users',
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    getAllUsers
);

router.get(
    '/admin/users/:id',
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    getUserById
);

router.patch(
    '/admin/users/:id/role',
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    updateUserRole
);

router.patch(
    '/admin/users/:id/status',
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    updateUserStatus
);

router.delete(
    '/admin/users/:id',
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    deleteUser
);

export default router;

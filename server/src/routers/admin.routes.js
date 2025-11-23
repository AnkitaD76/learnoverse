import express from 'express';
import {
    getAllUsers,
    getSingleUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getUserStats,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorization.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Admin routes
router.get('/stats', getUserStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;

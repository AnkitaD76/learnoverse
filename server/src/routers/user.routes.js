import express from 'express';
import {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    uploadAvatar,
    updateUserPassword,
    deleteUser,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorization.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User's own profile routes
router.get('/showMe', showCurrentUser); // localhost:3000/api/v1/users/showMe
router.patch('/updateUser', updateUser);
router.patch('/uploadAvatar', upload.single('avatar'), uploadAvatar);
router.patch('/updateUserPassword', updateUserPassword);

// Admin only routes
router.get('/', authorizeRoles('admin'), getAllUsers);

// Routes that check individual permissions
router.get('/:id', getSingleUser);
router.delete('/:id', deleteUser);

export default router;

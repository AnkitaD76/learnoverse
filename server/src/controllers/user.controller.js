import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private (any authenticated user)
 */
export const getMyProfile = async (req, res) => {
    const user = await User.findById(req.user.userId)
        .select('-password')
        .lean();

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        user,
    });
};

/**
 * @desc    Update current user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private (any authenticated user)
 */
export const updateMyProfile = async (req, res) => {
    const { name, age, gender, location, occupation } = req.body;

    // Don't allow updating sensitive fields (email, password, role)
    const allowedUpdates = { name, age, gender, location, occupation };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(
        key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // Check if there are any updates
    if (Object.keys(allowedUpdates).length === 0) {
        throw new BadRequestError(
            'Please provide at least one field to update'
        );
    }

    const user = await User.findByIdAndUpdate(req.user.userId, allowedUpdates, {
        new: true,
        runValidators: true,
    }).select('-password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Profile updated successfully',
        user,
    });
};

/**
 * @desc    Admin Dashboard - Overview with statistics
 * @route   GET /api/v1/users/admin/dashboard
 * @access  Private (Admin only)
 */
export const getAdminDashboard = async (req, res) => {
    // Get statistics
    const totalUsers = await User.countDocuments({ status: 'active' });
    const adminCount = await User.countDocuments({
        role: 'admin',
        status: 'active',
    });
    const instructorCount = await User.countDocuments({
        role: 'instructor',
        status: 'active',
    });
    const studentCount = await User.countDocuments({
        role: 'student',
        status: 'active',
    });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Get recent users
    const recentUsers = await User.find({ status: 'active' })
        .select('name email role createdAt isVerified')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    res.status(StatusCodes.OK).json({
        success: true,
        dashboard: {
            statistics: {
                totalUsers,
                adminCount,
                instructorCount,
                studentCount,
                verifiedUsers,
                unverifiedUsers,
            },
            recentUsers,
        },
    });
};

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/v1/users/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
    const { page = 1, limit = 20, role, status, search } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();

    const total = await User.countDocuments(query);

    res.status(StatusCodes.OK).json({
        success: true,
        count: users.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        users,
    });
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/v1/users/admin/users/:id/role
 * @access  Private (Admin only)
 */
export const updateUserRole = async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;

    // Validate role
    if (!['admin', 'instructor', 'student'].includes(role)) {
        throw new BadRequestError(
            'Invalid role. Must be admin, instructor, or student'
        );
    }

    // Prevent admin from demoting themselves
    if (id === req.user.userId && role !== 'admin') {
        throw new BadRequestError('You cannot change your own admin role');
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User role updated successfully',
        user,
    });
};

/**
 * @desc    Instructor Dashboard
 * @route   GET /api/v1/users/instructor/dashboard
 * @access  Private (Instructor and Admin)
 */
export const getInstructorDashboard = async (req, res) => {
    // Get instructor's course statistics (placeholder - implement when Course model exists)
    const instructorStats = {
        totalCourses: 0,
        totalStudents: 0,
        pendingAssignments: 0,
    };

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Welcome to Instructor Dashboard',
        user: {
            name: req.user.name,
            role: req.user.role,
        },
        statistics: instructorStats,
        features: [
            'Create and manage courses',
            'View student progress',
            'Manage assignments and grades',
            'Upload course content',
        ],
    });
};

/**
 * @desc    Student Dashboard
 * @route   GET /api/v1/users/student/dashboard
 * @access  Private (Student and above)
 */
export const getStudentDashboard = async (req, res) => {
    // Get student's enrollment statistics (placeholder - implement when Course model exists)
    const studentStats = {
        enrolledCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
    };

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Welcome to Student Dashboard',
        user: {
            name: req.user.name,
            role: req.user.role,
        },
        statistics: studentStats,
        features: [
            'View enrolled courses',
            'Access course materials',
            'Submit assignments',
            'Track your progress',
        ],
    });
};

/**
 * @desc    Get single user by ID (Admin only)
 * @route   GET /api/v1/users/admin/users/:id
 * @access  Private (Admin only)
 */
export const getUserById = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        user,
    });
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/users/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
        throw new BadRequestError('You cannot delete your own account');
    }

    const user = await User.findByIdAndUpdate(
        id,
        { status: 'deleted' },
        { new: true }
    );

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User deleted successfully',
    });
};

/**
 * @desc    Update user status (Admin only)
 * @route   PATCH /api/v1/users/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    if (!['active', 'inactive', 'suspended', 'deleted'].includes(status)) {
        throw new BadRequestError('Invalid status');
    }

    // Prevent admin from suspending themselves
    if (id === req.user.userId && status !== 'active') {
        throw new BadRequestError('You cannot change your own account status');
    }

    const user = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: `User status updated to ${status}`,
        user,
    });
};

export default {
    getMyProfile,
    updateMyProfile,
    getAdminDashboard,
    getAllUsers,
    updateUserRole,
    getInstructorDashboard,
    getStudentDashboard,
    getUserById,
    deleteUser,
    updateUserStatus,
};

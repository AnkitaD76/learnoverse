import { StatusCodes } from 'http-status-codes';
import { User, Course } from '../models/index.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  const { role, isVerified, isActive, search } = req.query;

  const queryObject = {};

  if (role) queryObject.role = role;

  if (isVerified !== undefined) queryObject.isVerified = isVerified === 'true';
  if (isActive !== undefined) queryObject.isActive = isActive === 'true';

  if (search) {
    queryObject.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(queryObject).select('-password').sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: users.length,
    users,
  });
};

/**
 * @desc    Get single user (Admin)
 * @route   GET /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) throw new NotFoundError(`User not found with id: ${req.params.id}`);

  res.status(StatusCodes.OK).json({ success: true, user });
};

/**
 * @desc    Update user role (Admin)
 * @route   PATCH /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!role) throw new BadRequestError('Please provide a role');

  const validRoles = ['admin', 'instructor', 'student', 'moderator'];
  if (!validRoles.includes(role)) throw new BadRequestError('Invalid role');

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError(`User not found with id: ${req.params.id}`);

  if (user._id.toString() === req.user.userId.toString()) {
    throw new BadRequestError('You cannot change your own role');
  }

  user.role = role;
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User role updated successfully',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

/**
 * @desc    Activate/Deactivate user account (Admin)
 * @route   PATCH /api/v1/admin/users/:id/status
 * @access  Private/Admin
 */
export const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;
  if (isActive === undefined) throw new BadRequestError('Please provide isActive status');

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError(`User not found with id: ${req.params.id}`);

  if (user._id.toString() === req.user.userId.toString()) {
    throw new BadRequestError('You cannot change your own account status');
  }

  user.isActive = isActive;
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
    user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive },
  });
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError(`User not found with id: ${req.params.id}`);

  if (user._id.toString() === req.user.userId.toString()) {
    throw new BadRequestError('You cannot delete your own account');
  }

  await user.deleteOne();

  res.status(StatusCodes.OK).json({ success: true, message: 'User deleted successfully' });
};

/**
 * @desc    Get user statistics (Admin)
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
export const getUserStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const activeUsers = await User.countDocuments({ isActive: true });

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort('-createdAt')
    .limit(5);

  res.status(StatusCodes.OK).json({
    success: true,
    stats: { totalUsers, verifiedUsers, activeUsers, usersByRole, recentUsers },
  });
};

/* ================================
   COURSE APPROVAL (ADMIN)
   ================================ */

/**
 * @desc    Get pending courses (Admin)
 * @route   GET /api/v1/admin/courses/pending
 * @access  Private/Admin
 *
 * NOTE: This assumes Course has "status" field.
 * If your Course model currently does NOT have it,
 * tell me and I’ll give you the model update too.
 */
export const getPendingCourses = async (req, res) => {
  const courses = await Course.find({ status: 'pending' })
    .populate('instructor', 'name email')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    count: courses.length,
    courses,
  });
};

/**
 * @desc    Approve course (Admin)
 * @route   PATCH /api/v1/admin/courses/:id/approve
 * @access  Private/Admin
 */
export const approveCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new NotFoundError('Course not found');

  course.status = 'approved';
  course.isPublished = true;
  course.approvedBy = req.user.userId;
  course.approvedAt = new Date();
  course.rejectionReason = '';

  await course.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course approved',
    course,
  });
};

/**
 * @desc    Reject course (Admin)
 * @route   PATCH /api/v1/admin/courses/:id/reject
 * @access  Private/Admin
 */
export const rejectCourse = async (req, res) => {
  const { reason = 'Rejected by admin' } = req.body;

  const course = await Course.findById(req.params.id);
  if (!course) throw new NotFoundError('Course not found');

  course.status = 'rejected';
  course.isPublished = false;
  course.rejectionReason = reason;

  await course.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course rejected',
    course,
  });
};

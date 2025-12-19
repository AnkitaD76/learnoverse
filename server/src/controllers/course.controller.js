import { StatusCodes } from 'http-status-codes';
import { Course, Enrollment } from '../models/index.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/index.js';

/**
 * GET /api/v1/courses
 * Public course browsing with optional filters
 */
export const getCourses = async (req, res) => {
  const { search, category, level } = req.query;

  const query = { isPublished: true };

  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.title = { $regex: search, $options: 'i' };

  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort('-createdAt');

  res
    .status(StatusCodes.OK)
    .json({ success: true, count: courses.length, courses });
};

/**
 * GET /api/v1/courses/:id
 */
export const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    'instructor',
    'name email'
  );

  if (!course) throw new NotFoundError('Course not found');

  res.status(StatusCodes.OK).json({ success: true, course });
};

/**
 * POST /api/v1/courses
 * Only instructor/admin
 */
export const createCourse = async (req, res) => {
  const { role, userId } = req.user;

  if (role !== 'instructor' && role !== 'admin') {
    throw new UnauthorizedError('Only instructors or admins can create courses');
  }

  const { title, description, category, level, pricePoints, skillTags } = req.body;

  if (!title) throw new BadRequestError('Title is required');

  const course = await Course.create({
    title,
    description,
    category,
    level: level || 'beginner',
    pricePoints: pricePoints || 0,
    skillTags: Array.isArray(skillTags)
      ? skillTags
      : typeof skillTags === 'string' && skillTags.length
      ? skillTags.split(',').map(s => s.trim())
      : [],
    instructor: userId,
  });

  res.status(StatusCodes.CREATED).json({ success: true, course });
};

/**
 * POST /api/v1/courses/:id/enroll
 */
export const enrollInCourse = async (req, res) => {
  const userId = req.user.userId;
  const courseId = req.params.id;

  const course = await Course.findById(courseId);
  if (!course) throw new NotFoundError('Course not found');

  if (String(course.instructor) === String(userId)) {
    throw new BadRequestError('Instructors cannot enroll in their own course');
  }

  let enrollment = await Enrollment.findOne({ user: userId, course: courseId });

  if (enrollment && enrollment.status === 'enrolled') {
    throw new BadRequestError('You are already enrolled in this course');
  }

  if (!enrollment) {
    enrollment = await Enrollment.create({ user: userId, course: courseId });
    course.enrollCount += 1;
    await course.save();
  } else {
    enrollment.status = 'enrolled';
    enrollment.enrolledAt = new Date();
    enrollment.withdrawnAt = null;
    enrollment.refundIssued = false;
    enrollment.refundAmount = 0;
    await enrollment.save();

    course.enrollCount += 1;
    await course.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Enrolled successfully',
    enrollment,
  });
};

/**
 * POST /api/v1/courses/:id/withdraw
 */
export const withdrawFromCourse = async (req, res) => {
  const userId = req.user.userId;
  const courseId = req.params.id;

  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });

  if (!enrollment || enrollment.status !== 'enrolled') {
    throw new BadRequestError('You are not currently enrolled in this course');
  }

  enrollment.status = 'withdrawn';
  enrollment.withdrawnAt = new Date();
  enrollment.refundIssued = true;
  enrollment.refundAmount = 0;

  await enrollment.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'You have withdrawn from the course.',
    enrollment,
  });
};

/**
 * DELETE /api/v1/courses/:id
 * Only admin or course instructor can delete
 */
export const deleteCourse = async (req, res) => {
  const { role, userId } = req.user;
  const courseId = req.params.id;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new NotFoundError('Course not found');
  }

  // Check if user is admin or the course instructor
  if (role !== 'admin' && String(course.instructor) !== String(userId)) {
    throw new UnauthorizedError('You do not have permission to delete this course');
  }

  await Course.findByIdAndDelete(courseId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course deleted successfully',
  });
};

/**
 * GET /api/v1/courses/my-enrollments
 */
export const getMyEnrollments = async (req, res) => {
  const userId = req.user.userId;

  const enrollments = await Enrollment.find({
    user: userId,
    status: 'enrolled',
  })
    .populate('course')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({
    success: true,
    enrollments,
  });
};

/**
 * ✅ NEW
 * GET /api/v1/courses/me/created
 */
export const getMyCreatedCourses = async (req, res) => {
  const userId = req.user.userId;

  const courses = await Course.find({ instructor: userId })
    .sort('-createdAt')
    .populate('instructor', 'name email');

  res.status(StatusCodes.OK).json({
    success: true,
    courses,
  });
};

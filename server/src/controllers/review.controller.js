import { StatusCodes } from 'http-status-codes';
import { Review, Course, User, Enrollment } from '../models/index.js';
import {
    BadRequestError,
    NotFoundError,
    UnauthenticatedError,
    UnauthorizedError,
} from '../errors/index.js';

// Helper function to recalculate and update course average rating
const updateCourseRating = async courseId => {
    const reviews = await Review.find({ course: courseId });

    if (reviews.length === 0) {
        await Course.findByIdAndUpdate(courseId, {
            averageRating: 0,
            reviewCount: 0,
        });
        return;
    }

    const totalRating = reviews.reduce(
        (sum, review) => sum + review.courseRating,
        0
    );
    const averageRating = totalRating / reviews.length;

    await Course.findByIdAndUpdate(courseId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: reviews.length,
    });
};

// Helper function to recalculate and update instructor average rating
const updateInstructorRating = async instructorId => {
    // Get all courses by this instructor
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map(c => c._id);

    // Get all reviews for these courses
    const reviews = await Review.find({ course: { $in: courseIds } });

    if (reviews.length === 0) {
        await User.findByIdAndUpdate(instructorId, {
            instructorAverageRating: 0,
            instructorReviewCount: 0,
        });
        return;
    }

    const totalRating = reviews.reduce(
        (sum, review) => sum + review.instructorRating,
        0
    );
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(instructorId, {
        instructorAverageRating: Math.round(averageRating * 10) / 10,
        instructorReviewCount: reviews.length,
    });
};

/**
 * @desc    Create a review for a course
 * @route   POST /api/v1/reviews
 * @access  Private (Enrolled students only)
 */
export const createReview = async (req, res) => {
    const { courseId, courseRating, instructorRating, reviewText } = req.body;
    const userId = req.user.userId;

    // Check if course exists
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
    });
    if (!enrollment) {
        throw new UnauthorizedError(
            'You must be enrolled in this course to leave a review'
        );
    }

    // Prevent instructors from reviewing their own courses
    if (course.instructor._id.toString() === userId) {
        throw new BadRequestError('You cannot review your own course');
    }

    // Check if user already reviewed this course
    const existingReview = await Review.findOne({
        user: userId,
        course: courseId,
    });
    if (existingReview) {
        throw new BadRequestError('You have already reviewed this course');
    }

    // Create review
    const review = await Review.create({
        user: userId,
        course: courseId,
        courseRating,
        instructorRating,
        reviewText: reviewText || '',
    });

    // Update course and instructor ratings
    await updateCourseRating(courseId);
    await updateInstructorRating(course.instructor._id);

    // Populate user info before sending response
    await review.populate('user', 'name avatar');

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Review created successfully',
        review,
    });
};

/**
 * @desc    Update user's own review
 * @route   PATCH /api/v1/reviews/:id
 * @access  Private
 */
export const updateReview = async (req, res) => {
    const { id } = req.params;
    const { courseRating, instructorRating, reviewText } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(id).populate({
        path: 'course',
        populate: { path: 'instructor' },
    });

    if (!review) {
        throw new NotFoundError('Review not found');
    }

    // Check ownership
    if (review.user.toString() !== userId) {
        throw new UnauthorizedError('You can only update your own reviews');
    }

    // Update fields
    if (courseRating !== undefined) review.courseRating = courseRating;
    if (instructorRating !== undefined)
        review.instructorRating = instructorRating;
    if (reviewText !== undefined) review.reviewText = reviewText;

    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();

    // Update course and instructor ratings
    await updateCourseRating(review.course._id);
    await updateInstructorRating(review.course.instructor._id);

    await review.populate('user', 'name avatar');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Review updated successfully',
        review,
    });
};

/**
 * @desc    Delete user's own review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(id).populate({
        path: 'course',
        populate: { path: 'instructor' },
    });

    if (!review) {
        throw new NotFoundError('Review not found');
    }

    // Check ownership
    if (review.user.toString() !== userId) {
        throw new UnauthorizedError('You can only delete your own reviews');
    }

    const courseId = review.course._id;
    const instructorId = review.course.instructor._id;

    await review.deleteOne();

    // Update course and instructor ratings
    await updateCourseRating(courseId);
    await updateInstructorRating(instructorId);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Review deleted successfully',
    });
};

/**
 * @desc    Get all reviews for a course
 * @route   GET /api/v1/reviews/course/:courseId
 * @access  Public
 */
export const getCourseReviews = async (req, res) => {
    const { courseId } = req.params;
    const { page, limit, sortBy } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
        case 'newest':
            sortCriteria = { createdAt: -1 };
            break;
        case 'oldest':
            sortCriteria = { createdAt: 1 };
            break;
        case 'highest':
            sortCriteria = { courseRating: -1 };
            break;
        case 'lowest':
            sortCriteria = { courseRating: 1 };
            break;
        case 'helpful':
            sortCriteria = { helpfulCount: -1 };
            break;
        default:
            sortCriteria = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ course: courseId })
        .populate('user', 'name avatar')
        .sort(sortCriteria)
        .limit(limit)
        .skip(skip);

    const totalReviews = await Review.countDocuments({ course: courseId });

    res.status(StatusCodes.OK).json({
        success: true,
        reviews,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalReviews / limit),
            totalReviews,
            reviewsPerPage: limit,
        },
    });
};

/**
 * @desc    Get user's review for a specific course
 * @route   GET /api/v1/reviews/my-review/:courseId
 * @access  Private
 */
export const getUserReview = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({
        user: userId,
        course: courseId,
    }).populate('user', 'name avatar');

    if (!review) {
        return res.status(StatusCodes.OK).json({
            success: true,
            review: null,
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        review,
    });
};

/**
 * @desc    Mark review as helpful or not helpful
 * @route   PATCH /api/v1/reviews/:id/helpful
 * @access  Private
 */
export const markReviewHelpful = async (req, res) => {
    const { id } = req.params;
    const { helpful } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(id);
    if (!review) {
        throw new NotFoundError('Review not found');
    }

    // Cannot mark own review
    if (review.user.toString() === userId) {
        throw new BadRequestError('You cannot mark your own review as helpful');
    }

    // Remove previous vote if exists
    const wasHelpful = review.helpfulBy.includes(userId);
    const wasNotHelpful = review.notHelpfulBy.includes(userId);

    if (wasHelpful) {
        review.helpfulBy = review.helpfulBy.filter(
            id => id.toString() !== userId
        );
        review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    }

    if (wasNotHelpful) {
        review.notHelpfulBy = review.notHelpfulBy.filter(
            id => id.toString() !== userId
        );
        review.notHelpfulCount = Math.max(0, review.notHelpfulCount - 1);
    }

    // Add new vote
    if (helpful) {
        if (!wasHelpful) {
            review.helpfulBy.push(userId);
            review.helpfulCount += 1;
        }
    } else {
        if (!wasNotHelpful) {
            review.notHelpfulBy.push(userId);
            review.notHelpfulCount += 1;
        }
    }

    await review.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Review feedback updated',
        helpfulCount: review.helpfulCount,
        notHelpfulCount: review.notHelpfulCount,
    });
};

/**
 * @desc    Delete any review (Admin only)
 * @route   DELETE /api/v1/reviews/admin/:id
 * @access  Private/Admin
 */
export const adminDeleteReview = async (req, res) => {
    const { id } = req.params;

    const review = await Review.findById(id).populate({
        path: 'course',
        populate: { path: 'instructor' },
    });

    if (!review) {
        throw new NotFoundError('Review not found');
    }

    const courseId = review.course._id;
    const instructorId = review.course.instructor._id;

    await review.deleteOne();

    // Update course and instructor ratings
    await updateCourseRating(courseId);
    await updateInstructorRating(instructorId);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Review deleted successfully by admin',
    });
};

/**
 * @desc    Get rating distribution for a course
 * @route   GET /api/v1/reviews/course/:courseId/distribution
 * @access  Public
 */
export const getRatingDistribution = async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Get count for each rating (1-5)
    const distribution = await Review.aggregate([
        { $match: { course: course._id } },
        {
            $group: {
                _id: '$courseRating',
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: -1 } },
    ]);

    // Format to include all ratings 1-5
    const formattedDistribution = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map(
        rating => {
            const found = distribution.find(d => d._id === rating);
            return {
                rating,
                count: found ? found.count : 0,
            };
        }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        distribution: formattedDistribution,
        totalReviews: course.reviewCount,
        averageRating: course.averageRating,
    });
};

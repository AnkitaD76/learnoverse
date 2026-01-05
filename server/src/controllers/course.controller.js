import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { Course, Enrollment, Wallet, Transaction } from '../models/index.js';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '../errors/index.js';
import { spawn } from 'child_process';
import path from 'path';
import { checkCourseCompletion } from '../services/completion.service.js';

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

    res.status(StatusCodes.OK).json({
        success: true,
        count: courses.length,
        courses,
    });
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
 * Any verified user can create a course (member/instructor/admin).
 * The course will remain pending until admin approval.
 */
export const createCourse = async (req, res) => {
    const { userId } = req.user;

    const {
        title,
        description,
        category,
        level,
        pricePoints,
        skillTags,
        lessons,
        skillSwapEnabled,
    } = req.body;

    if (!title) throw new BadRequestError('Title is required');

    // Debug: log incoming lessons
    console.log('📚 Creating course with lessons:', lessons);

    // Validate lessons payload early to provide clearer error messages
    if (lessons && !Array.isArray(lessons)) {
        throw new BadRequestError('Lessons must be an array');
    }

    if (Array.isArray(lessons)) {
        const allowedTypes = ['video', 'text', 'live'];
        for (let i = 0; i < lessons.length; i++) {
            const l = lessons[i];
            if (!l || typeof l !== 'object') {
                throw new BadRequestError(
                    `Lesson at index ${i} must be an object`
                );
            }
            if (!l.title || !String(l.title).trim()) {
                throw new BadRequestError(
                    `Lesson at index ${i} is missing a title`
                );
            }
            if (!l.type || !allowedTypes.includes(l.type)) {
                throw new BadRequestError(
                    `Lesson at index ${i} has invalid or missing type`
                );
            }
        }
    }

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
        lessons: Array.isArray(lessons) ? lessons : [],
        skillSwapEnabled: Boolean(skillSwapEnabled),

        // ✅ Always require admin approval before publishing
        status: 'pending',
        isPublished: false,
    });

    // Debug: log saved course
    console.log('✅ Course created with lessons:', course.lessons);

    // If any lessons include a pre-filled live.roomName, spawn keepalive processes
    try {
        if (Array.isArray(course.lessons)) {
            for (const l of course.lessons) {
                if (
                    l.type === 'live' &&
                    l.live?.roomName &&
                    !l.live?.keepalivePid
                ) {
                    try {
                        const runnerPath = path.resolve(
                            process.cwd(),
                            'server',
                            'src',
                            'utils',
                            'jitsiKeepaliveRunner.js'
                        );
                        const child = spawn(
                            process.execPath,
                            [runnerPath, l.live.roomName],
                            {
                                detached: true,
                                stdio: 'ignore',
                            }
                        );
                        child.unref();
                        l.live.keepalivePid = child.pid;
                        console.log(
                            'Spawned keepalive(pid=',
                            child.pid,
                            ') for prefilled lesson room=',
                            l.live.roomName
                        );
                    } catch (e) {
                        console.error(
                            'Failed to spawn keepalive for lesson during course create',
                            e
                        );
                    }
                }
            }
            // save updated PIDs
            await course.save();
        }
    } catch (e) {
        console.error(
            'Error while attempting to spawn keepalives on course create',
            e
        );
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        message:
            'Course created and submitted for admin approval. It will be published once approved.',
        course,
    });
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
        throw new BadRequestError(
            'Instructors cannot enroll in their own course'
        );
    }

    let enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
    });

    if (enrollment && enrollment.status === 'enrolled') {
        throw new BadRequestError('You are already enrolled in this course');
    }

    if (!enrollment) {
        enrollment = await Enrollment.create({
            user: userId,
            course: courseId,
        });
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

    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
    });

    if (!enrollment || enrollment.status !== 'enrolled') {
        throw new BadRequestError(
            'You are not currently enrolled in this course'
        );
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
        throw new UnauthorizedError(
            'You do not have permission to delete this course'
        );
    }

    await Course.findByIdAndDelete(courseId);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Course deleted successfully',
    });
};

/**
 * GET /api/v1/courses/:id/enrollments
 * Get all enrolled students for a course
 * Only admin or course instructor can view
 */
export const getCourseEnrollments = async (req, res) => {
    const { role, userId } = req.user;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);

    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Check if user is admin, course instructor, or enrolled in the course
    let isAuthorized =
        role === 'admin' || String(course.instructor) === String(userId);

    if (!isAuthorized) {
        // Check if user is enrolled in the course
        const enrollment = await Enrollment.findOne({
            course: courseId,
            user: userId,
            status: 'enrolled',
        });
        isAuthorized = !!enrollment;
    }

    if (!isAuthorized) {
        throw new UnauthorizedError(
            'You do not have permission to view enrollments for this course'
        );
    }

    const enrollments = await Enrollment.find({
        course: courseId,
        status: 'enrolled',
    })
        .populate('user', 'name email avatar')
        .sort('-enrolledAt');

    res.status(StatusCodes.OK).json({
        success: true,
        count: enrollments.length,
        enrollments,
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

    // Add progress information to each enrollment (including evaluations)
    const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async enrollment => {
            const completionStatus = await checkCourseCompletion(
                userId,
                enrollment.course._id
            );

            return {
                ...enrollment.toObject(),
                progress: completionStatus.progress,
                isComplete: completionStatus.isComplete,
                completionReason: completionStatus.reason,
            };
        })
    );

    res.status(StatusCodes.OK).json({
        success: true,
        enrollments: enrollmentsWithProgress,
    });
};

/**
 * GET /api/v1/courses/:id/my-enrollment
 * Get current user's enrollment for a specific course
 */
export const getMyEnrollment = async (req, res) => {
    const userId = req.user.userId;
    const courseId = req.params.id;

    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: 'enrolled',
    }).populate('course');

    if (!enrollment) {
        return res.status(StatusCodes.OK).json({
            success: true,
            enrollment: null,
        });
    }

    // Get comprehensive progress including evaluations
    const completionStatus = await checkCourseCompletion(userId, courseId);

    res.status(StatusCodes.OK).json({
        success: true,
        enrollment: {
            ...enrollment.toObject(),
            progress: completionStatus.progress,
            isComplete: completionStatus.isComplete,
            completionReason: completionStatus.reason,
        },
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

/**
 * POST /api/v1/courses/:id/enroll-with-points
 *
 * Enroll in a course using points.
 */
export const enrollInCourseWithPoints = async (req, res) => {
    const userId = req.user.userId;
    const courseId = req.params.id;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    if (!course.isPublished) {
        throw new BadRequestError('Cannot enroll in unpublished course');
    }

    // Prevent instructor self-enrollment
    if (String(course.instructor) === String(userId)) {
        throw new BadRequestError(
            'Instructors cannot enroll in their own course'
        );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: 'enrolled',
    });

    if (existingEnrollment) {
        throw new BadRequestError('You are already enrolled in this course');
    }

    // Validate course has a price
    if (!course.pricePoints || course.pricePoints <= 0) {
        throw new BadRequestError(
            'This course is free - use regular enrollment endpoint'
        );
    }

    // Check wallet balance
    const wallet = await Wallet.getOrCreate(userId);
    if (!wallet.hasSufficientBalance(course.pricePoints)) {
        throw new BadRequestError(
            `Insufficient points. Required: ${course.pricePoints}, Available: ${wallet.available_balance}`
        );
    }

    // Start atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create or update enrollment
        let enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        }).session(session);

        if (!enrollment) {
            enrollment = await Enrollment.create(
                [
                    {
                        user: userId,
                        course: courseId,
                        status: 'enrolled',
                        enrolledAt: new Date(),
                        paymentMethod: 'POINTS',
                        pointsPaid: course.pricePoints,
                    },
                ],
                { session }
            );
            enrollment = enrollment[0];

            // Increment enrollment count
            await Course.findByIdAndUpdate(
                courseId,
                { $inc: { enrollCount: 1 } },
                { session }
            );
        } else {
            // Re-enrolling after withdrawal
            enrollment.status = 'enrolled';
            enrollment.enrolledAt = new Date();
            enrollment.withdrawnAt = null;
            enrollment.paymentMethod = 'POINTS';
            enrollment.pointsPaid = course.pricePoints;
            await enrollment.save({ session });

            // Increment enrollment count
            await Course.findByIdAndUpdate(
                courseId,
                { $inc: { enrollCount: 1 } },
                { session }
            );
        }

        // Create transaction record (ENROLLMENT type)
        const transaction = await Transaction.create(
            [
                {
                    userId,
                    type: 'ENROLLMENT',
                    points_amount: -course.pricePoints, // Negative = debit
                    status: 'COMPLETED',
                    description: `Enrollment in course: ${course.title}`,
                    related_course: courseId,
                    related_enrollment: enrollment._id,
                    completed_at: new Date(),
                },
            ],
            { session }
        );

        // Debit points from wallet (atomic)
        await Wallet.debitPoints(userId, course.pricePoints);

        // Commit transaction
        await session.commitTransaction();

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Successfully enrolled using points',
            enrollment: {
                id: enrollment._id,
                course: {
                    id: course._id,
                    title: course.title,
                },
                points_paid: course.pricePoints,
                enrolled_at: enrollment.enrolledAt,
            },
            transaction: {
                id: transaction[0]._id,
                transaction_id: transaction[0].transaction_id,
                points_amount: course.pricePoints,
            },
            wallet: {
                previous_balance: wallet.points_balance,
                new_balance: wallet.points_balance - course.pricePoints,
                available_balance:
                    wallet.available_balance - course.pricePoints,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * POST /api/v1/courses/:id/lessons
 * Add a lesson to an existing course (only instructor or admin)
 */
export const addLessonToCourse = async (req, res) => {
    const { role, userId } = req.user;
    const courseId = req.params.id;

    const { title, type, contentUrl, textContent, live } = req.body;

    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');

    if (role !== 'admin' && String(course.instructor) !== String(userId)) {
        throw new UnauthorizedError(
            'You do not have permission to modify this course'
        );
    }

    if (!title || !title.trim()) {
        throw new BadRequestError('Lesson title is required');
    }

    const order = Array.isArray(course.lessons) ? course.lessons.length : 0;
    const lesson = { title: title.trim(), type: type || 'video', order };

    if (lesson.type === 'video') lesson.contentUrl = contentUrl || '';
    if (lesson.type === 'text') lesson.textContent = textContent || '';
    if (lesson.type === 'live') lesson.live = live || {};

    course.lessons = course.lessons || [];
    course.lessons.push(lesson);

    await course.save();

    // If lesson contains a prefilled live.roomName, spawn keepalive
    try {
        const pushed = course.lessons[course.lessons.length - 1];
        if (
            pushed.type === 'live' &&
            pushed.live?.roomName &&
            !pushed.live?.keepalivePid
        ) {
            try {
                const runnerPath = path.resolve(
                    process.cwd(),
                    'server',
                    'src',
                    'utils',
                    'jitsiKeepaliveRunner.js'
                );
                const child = spawn(
                    process.execPath,
                    [runnerPath, pushed.live.roomName],
                    {
                        detached: true,
                        stdio: 'ignore',
                    }
                );
                child.unref();
                pushed.live.keepalivePid = child.pid;
                await course.save();
                console.log(
                    'Spawned keepalive(pid=',
                    child.pid,
                    ') for added lesson room=',
                    pushed.live.roomName
                );
            } catch (e) {
                console.error('Failed to spawn keepalive for added lesson', e);
            }
        }
    } catch (e) {
        console.error('Error handling keepalive for added lesson', e);
    }

    res.status(StatusCodes.OK).json({
        success: true,
        course,
        message: 'Lesson added',
    });
};

/**
 * PATCH /api/v1/courses/:id/lessons/:lessonId
 * Update a lesson inside a course (only instructor or admin)
 */
export const updateLessonInCourse = async (req, res) => {
    const { role, userId } = req.user;
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;

    const { title, type, contentUrl, textContent, live, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');

    if (role !== 'admin' && String(course.instructor) !== String(userId)) {
        throw new UnauthorizedError(
            'You do not have permission to modify this course'
        );
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    if (title !== undefined) lesson.title = title;
    if (type !== undefined) lesson.type = type;
    if (contentUrl !== undefined) lesson.contentUrl = contentUrl;
    if (textContent !== undefined) lesson.textContent = textContent;
    if (live !== undefined) lesson.live = live;
    if (order !== undefined) lesson.order = order;

    await course.save();

    // If lesson is live and has a roomName but no keepalive, spawn one.
    try {
        if (
            lesson.type === 'live' &&
            lesson.live?.roomName &&
            !lesson.live?.keepalivePid
        ) {
            try {
                const runnerPath = path.resolve(
                    process.cwd(),
                    'server',
                    'src',
                    'utils',
                    'jitsiKeepaliveRunner.js'
                );
                const child = spawn(
                    process.execPath,
                    [runnerPath, lesson.live.roomName],
                    {
                        detached: true,
                        stdio: 'ignore',
                    }
                );
                child.unref();
                lesson.live.keepalivePid = child.pid;
                await course.save();
                console.log(
                    'Spawned keepalive(pid=',
                    child.pid,
                    ') for updated lesson room=',
                    lesson.live.roomName
                );
            } catch (e) {
                console.error(
                    'Failed to spawn keepalive for updated lesson',
                    e
                );
            }
        }

        // If live room was removed but a keepalive exists, try to kill it and clear PID
        if (!lesson.live?.roomName && lesson.live?.keepalivePid) {
            try {
                process.kill(lesson.live.keepalivePid);
            } catch (e) {
                // ignore errors when killing
            }
            lesson.live.keepalivePid = null;
            await course.save();
        }
    } catch (e) {
        console.error('Error handling keepalive for updated lesson', e);
    }

    res.status(StatusCodes.OK).json({
        success: true,
        course,
        message: 'Lesson updated',
    });
};

/**
 * DELETE /api/v1/courses/:id/lessons/:lessonId
 * Remove a lesson from a course (only instructor or admin)
 */
export const deleteLessonFromCourse = async (req, res) => {
    const { role, userId } = req.user;
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;

    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');

    if (role !== 'admin' && String(course.instructor) !== String(userId)) {
        throw new UnauthorizedError(
            'You do not have permission to modify this course'
        );
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    // If a keepalive PID exists for this lesson, try to kill it
    try {
        if (lesson.live?.keepalivePid) {
            try {
                process.kill(lesson.live.keepalivePid);
                console.log(
                    'Killed keepalive pid=',
                    lesson.live.keepalivePid,
                    'for lesson',
                    lessonId
                );
            } catch (e) {
                console.warn(
                    'Failed to kill keepalive pid',
                    lesson.live.keepalivePid,
                    e
                );
            }
            // clear PID
            lesson.live.keepalivePid = null;
        }
    } catch (e) {
        console.error(
            'Error while cleaning keepalive PID during lesson delete',
            e
        );
    }

    // Remove lesson
    try {
        if (lesson && typeof lesson.remove === 'function') {
            lesson.remove();
        } else {
            course.lessons = (course.lessons || []).filter(
                l => String(l._id) !== String(lessonId)
            );
        }
    } catch (e) {
        // fallback
        course.lessons = (course.lessons || []).filter(
            l => String(l._id) !== String(lessonId)
        );
    }

    await course.save();

    res.status(StatusCodes.OK).json({
        success: true,
        course,
        message: 'Lesson deleted',
    });
};

/**
 * POST /api/v1/courses/:id/lessons/:lessonId/create-live
 * Create a Jitsi live session (roomName + joinCode) for a lesson (instructor/admin only)
 */
export const createLiveSessionInLesson = async (req, res) => {
    const { role, userId } = req.user;
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;

    const { startTime } = req.body || {};

    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');

    if (role !== 'admin' && String(course.instructor) !== String(userId)) {
        throw new UnauthorizedError(
            'You do not have permission to modify this course'
        );
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    const roomName = `learnoverse-${courseId}-${Date.now().toString(36)}`;
    const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    lesson.live = lesson.live || {};
    lesson.live.roomName = roomName;
    lesson.live.joinCode = joinCode;
    if (startTime) lesson.live.startTime = new Date(startTime);

    await course.save();

    try {
        const runnerPath = path.resolve(
            process.cwd(),
            'server',
            'src',
            'utils',
            'jitsiKeepaliveRunner.js'
        );
        const child = spawn(process.execPath, [runnerPath, roomName], {
            detached: true,
            stdio: 'ignore',
        });
        child.unref();
        lesson.live.keepalivePid = child.pid;
        await course.save();
        console.log('Spawned keepalive pid=', child.pid, 'for room', roomName);
    } catch (e) {
        console.error('Failed to spawn keepalive runner', e);
    }

    res.status(StatusCodes.OK).json({
        success: true,
        course,
        message: 'Live session created',
        roomName,
        joinCode,
    });
};

/**
 * POST /api/v1/courses/:id/lessons/:lessonId/stop-keepalive
 * Stop the keepalive process for a lesson (if any) and clear the PID
 */
export const stopKeepaliveForLesson = async (req, res) => {
    const { role, userId } = req.user;
    const courseId = req.params.id;
    const lessonId = req.params.lessonId;

    const course = await Course.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');

    if (role !== 'admin' && String(course.instructor) !== String(userId)) {
        throw new UnauthorizedError(
            'You do not have permission to modify this course'
        );
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    if (lesson.live?.keepalivePid) {
        try {
            process.kill(lesson.live.keepalivePid);
        } catch (e) {
            console.warn(
                'Failed to kill keepalive pid',
                lesson.live.keepalivePid,
                e
            );
        }
        lesson.live.keepalivePid = null;
        await course.save();
    }

    res.status(StatusCodes.OK).json({
        success: true,
        course,
        message: 'Keepalive stopped',
    });
};

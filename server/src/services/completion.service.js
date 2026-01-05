import {
    Course,
    Enrollment,
    Evaluation,
    EvaluationSubmission,
    Certificate,
} from '../models/index.js';

/**
 * Check if a course is complete based on:
 * 1. All lessons completed (marked as done by student)
 * 2. All evaluations passed (quizzes/assignments with score >= passingGrade)
 *
 * AUTHORIZATION:
 * - Only enrolled students can mark lessons complete
 * - Only course instructors/admins can manage lessons (add/edit/delete)
 * - Certificate is auto-issued when all requirements are met
 *
 * @param {string} userId - Student user ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{isComplete: boolean, reason: string, progress: object}>}
 */
export const checkCourseCompletion = async (userId, courseId) => {
    // Get enrollment
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: 'enrolled',
    });

    if (!enrollment) {
        return {
            isComplete: false,
            reason: 'Not enrolled',
            progress: { lessons: 0, evaluations: 0, overall: 0 },
        };
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
        return {
            isComplete: false,
            reason: 'Course not found',
            progress: { lessons: 0, evaluations: 0, overall: 0 },
        };
    }

    // Check lessons completion
    const totalLessons = course.lessons?.length || 0;
    const completedLessons = enrollment.completedLessonIds?.length || 0;
    const lessonsProgress =
        totalLessons === 0
            ? 100
            : Math.round((completedLessons / totalLessons) * 100);
    const allLessonsComplete =
        totalLessons === 0 || completedLessons >= totalLessons;

    // Get all published/closed evaluations for this course
    const evaluations = await Evaluation.find({
        course: courseId,
        status: { $in: ['published', 'closed'] },
        isDeleted: false,
    });

    // If there are no evaluations, only lessons matter
    if (evaluations.length === 0) {
        return {
            isComplete: allLessonsComplete,
            reason: allLessonsComplete
                ? 'All lessons completed, no evaluations required'
                : 'Not all lessons completed',
            progress: {
                lessons: lessonsProgress,
                evaluations: 100,
                overall: lessonsProgress,
                completedLessons,
                totalLessons,
                passedEvaluations: 0,
                totalEvaluations: 0,
            },
        };
    }

    // Check if student has passed all evaluations
    // Get the latest submission for each evaluation
    const passedEvaluationIds = [];
    const failedEvaluationIds = [];
    const pendingEvaluationIds = [];

    for (const evaluation of evaluations) {
        // Get the latest submission for this evaluation
        const latestSubmission = await EvaluationSubmission.findOne({
            student: userId,
            evaluation: evaluation._id,
        }).sort({ attemptNumber: -1 });

        if (!latestSubmission) {
            pendingEvaluationIds.push(evaluation._id);
        } else if (latestSubmission.status !== 'graded') {
            pendingEvaluationIds.push(evaluation._id);
        } else if (latestSubmission.isPassed) {
            passedEvaluationIds.push(evaluation._id);
        } else {
            failedEvaluationIds.push(evaluation._id);
        }
    }

    const passedEvaluations = passedEvaluationIds.length;
    const totalEvaluations = evaluations.length;
    const evaluationsProgress = Math.round(
        (passedEvaluations / totalEvaluations) * 100
    );
    const allEvaluationsPassed = passedEvaluations >= totalEvaluations;

    // Overall progress is a combination of lessons and evaluations
    const overallProgress = Math.round(
        (lessonsProgress + evaluationsProgress) / 2
    );

    const isComplete = allLessonsComplete && allEvaluationsPassed;

    let reason;
    if (!allLessonsComplete && !allEvaluationsPassed) {
        reason = `Lessons: ${completedLessons}/${totalLessons}, Evaluations passed: ${passedEvaluations}/${totalEvaluations}`;
    } else if (!allLessonsComplete) {
        reason = `Not all lessons completed (${completedLessons}/${totalLessons})`;
    } else if (!allEvaluationsPassed) {
        if (pendingEvaluationIds.length > 0) {
            reason = `${pendingEvaluationIds.length} evaluation(s) pending submission or grading`;
        } else if (failedEvaluationIds.length > 0) {
            reason = `${failedEvaluationIds.length} evaluation(s) failed - retake required`;
        } else {
            reason = `Evaluations passed: ${passedEvaluations}/${totalEvaluations}`;
        }
    } else {
        reason =
            'All requirements met: lessons completed, all evaluations passed';
    }

    return {
        isComplete,
        reason,
        progress: {
            lessons: lessonsProgress,
            evaluations: evaluationsProgress,
            overall: overallProgress,
            completedLessons,
            totalLessons,
            passedEvaluations,
            totalEvaluations,
            failedEvaluations: failedEvaluationIds.length,
            pendingEvaluations: pendingEvaluationIds.length,
        },
    };
};

/**
 * Issue a certificate if course is complete
 *
 * @param {string} userId - Student user ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Certificate|null>}
 */
export const issueCertificateIfComplete = async (userId, courseId) => {
    const completionStatus = await checkCourseCompletion(userId, courseId);

    if (!completionStatus.isComplete) {
        return null;
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
        user: userId,
        course: courseId,
    });

    if (existingCertificate) {
        return existingCertificate;
    }

    // Create new certificate
    const certificate = await Certificate.create({
        user: userId,
        course: courseId,
    });

    return certificate;
};

import {
    Course,
    Enrollment,
    Evaluation,
    EvaluationSubmission,
    Certificate,
} from '../models/index.js';

/**
 * Check if a course is complete based on:
 * 1. All lessons completed
 * 2. Total evaluation score >= threshold (e.g., 50%)
 *
 * @param {string} userId - Student user ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{isComplete: boolean, reason: string, totalScore: number}>}
 */
export const checkCourseCompletion = async (userId, courseId) => {
    const SCORE_THRESHOLD = 50; // Minimum 50% total score required

    // Get enrollment
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: 'enrolled',
    });

    if (!enrollment) {
        return { isComplete: false, reason: 'Not enrolled', totalScore: 0 };
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
        return { isComplete: false, reason: 'Course not found', totalScore: 0 };
    }

    // Check lessons completion
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment.completedLessonIds.length;
    const allLessonsComplete =
        totalLessons === 0 || completedLessons >= totalLessons;

    if (!allLessonsComplete) {
        return {
            isComplete: false,
            reason: 'Not all lessons completed',
            totalScore: enrollment.totalScore || 0,
        };
    }

    // Get all published/closed evaluations for this course
    const evaluations = await Evaluation.find({
        course: courseId,
        status: { $in: ['published', 'closed'] },
        isDeleted: false,
    });

    // If there are no evaluations, course is complete
    if (evaluations.length === 0) {
        return {
            isComplete: true,
            reason: 'All lessons completed, no evaluations',
            totalScore: 0,
        };
    }

    // Calculate total score from enrollment (already calculated in gradeSubmission)
    const totalScore = enrollment.totalScore || 0;

    // Check if score meets threshold
    const meetsScoreRequirement = totalScore >= SCORE_THRESHOLD;

    if (!meetsScoreRequirement) {
        return {
            isComplete: false,
            reason: `Score ${totalScore}% is below threshold ${SCORE_THRESHOLD}%`,
            totalScore,
        };
    }

    return {
        isComplete: true,
        reason: `All requirements met: lessons complete, score ${totalScore}%`,
        totalScore,
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

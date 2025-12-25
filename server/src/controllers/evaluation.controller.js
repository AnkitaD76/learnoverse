import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import {
    Evaluation,
    EvaluationQuestion,
    EvaluationSubmission,
    Course,
    Enrollment,
} from '../models/index.js';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '../errors/index.js';
import { issueCertificateIfComplete } from '../services/completion.service.js';

/**
 * @desc    Create a new evaluation (assignment/quiz) for a course
 * @route   POST /api/v1/courses/:courseId/evaluations
 * @access  Private (Instructor/Admin only)
 */
export const createEvaluation = async (req, res) => {
    const { courseId } = req.params;
    const { userId, role } = req.user;
    const { type, title, description, totalMarks, weight, questions } =
        req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Ensure only instructor of the course or admin can create evaluations
    if (String(course.instructor) !== String(userId) && role !== 'admin') {
        throw new UnauthorizedError(
            'Only the course instructor can create evaluations'
        );
    }

    // Validate required fields
    if (!type || !['assignment', 'quiz'].includes(type)) {
        throw new BadRequestError(
            'Type is required and must be assignment or quiz'
        );
    }

    if (!title || title.trim().length < 3) {
        throw new BadRequestError(
            'Title is required and must be at least 3 characters'
        );
    }

    if (!totalMarks || totalMarks < 1) {
        throw new BadRequestError('Total marks must be at least 1');
    }

    if (weight === undefined || weight < 0 || weight > 100) {
        throw new BadRequestError('Weight must be between 0 and 100');
    }

    // Create evaluation
    // Always set instructor to course instructor (not the user creating it if admin)
    const evaluation = await Evaluation.create({
        course: courseId,
        instructor: course.instructor,
        type,
        title,
        description: description || '',
        totalMarks,
        weight,
        status: 'draft',
    });

    // Create questions if provided
    let createdQuestions = [];
    if (questions && Array.isArray(questions) && questions.length > 0) {
        // Validate questions
        let questionTotalMarks = 0;
        questions.forEach((q, index) => {
            if (!q.prompt || q.prompt.trim().length < 10) {
                throw new BadRequestError(
                    `Question ${index + 1}: Prompt must be at least 10 characters`
                );
            }
            if (!q.maxMarks || q.maxMarks < 1) {
                throw new BadRequestError(
                    `Question ${index + 1}: Max marks must be at least 1`
                );
            }
            questionTotalMarks += q.maxMarks;
        });

        // Validate total marks match
        if (questionTotalMarks !== totalMarks) {
            throw new BadRequestError(
                `Sum of question marks (${questionTotalMarks}) must equal total marks (${totalMarks})`
            );
        }

        // Create questions
        createdQuestions = await EvaluationQuestion.insertMany(
            questions.map((q, index) => ({
                evaluation: evaluation._id,
                prompt: q.prompt,
                maxMarks: q.maxMarks,
                order: index,
            }))
        );
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        evaluation: {
            ...evaluation.toObject(),
            questions: createdQuestions,
        },
    });
};

/**
 * @desc    Update a draft evaluation
 * @route   PUT /api/v1/evaluations/:id
 * @access  Private (Instructor/Admin only)
 */
export const updateEvaluation = async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;
    const { title, description, totalMarks, weight, questions } = req.body;

    // Find evaluation
    const evaluation = await Evaluation.findById(id).populate(
        'course',
        'instructor'
    );
    if (!evaluation) {
        throw new NotFoundError('Evaluation not found');
    }

    // Check authorization - allow evaluation instructor or course instructor
    const isEvaluationInstructor =
        String(evaluation.instructor) === String(userId);
    const isCourseInstructor =
        String(evaluation.course.instructor) === String(userId);

    if (!isEvaluationInstructor && !isCourseInstructor && role !== 'admin') {
        throw new UnauthorizedError(
            'Only the course instructor can update evaluations'
        );
    }

    // Can only update drafts
    if (evaluation.status !== 'draft') {
        throw new BadRequestError('Only draft evaluations can be updated');
    }

    // Update basic fields
    if (title) evaluation.title = title;
    if (description !== undefined) evaluation.description = description;
    if (totalMarks) evaluation.totalMarks = totalMarks;
    if (weight !== undefined) evaluation.weight = weight;

    await evaluation.save();

    // Update questions if provided
    let updatedQuestions = [];
    if (questions && Array.isArray(questions)) {
        // Delete existing questions
        await EvaluationQuestion.deleteMany({ evaluation: id });

        // Validate and create new questions
        if (questions.length > 0) {
            let questionTotalMarks = 0;
            questions.forEach((q, index) => {
                if (!q.prompt || q.prompt.trim().length < 10) {
                    throw new BadRequestError(
                        `Question ${index + 1}: Prompt must be at least 10 characters`
                    );
                }
                if (!q.maxMarks || q.maxMarks < 1) {
                    throw new BadRequestError(
                        `Question ${index + 1}: Max marks must be at least 1`
                    );
                }
                questionTotalMarks += q.maxMarks;
            });

            if (questionTotalMarks !== evaluation.totalMarks) {
                throw new BadRequestError(
                    `Sum of question marks (${questionTotalMarks}) must equal total marks (${evaluation.totalMarks})`
                );
            }

            updatedQuestions = await EvaluationQuestion.insertMany(
                questions.map((q, index) => ({
                    evaluation: id,
                    prompt: q.prompt,
                    maxMarks: q.maxMarks,
                    order: index,
                }))
            );
        }
    } else {
        // Fetch existing questions if not updating
        updatedQuestions = await EvaluationQuestion.find({
            evaluation: id,
        }).sort('order');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        evaluation: {
            ...evaluation.toObject(),
            questions: updatedQuestions,
        },
    });
};

/**
 * @desc    Publish an evaluation
 * @route   POST /api/v1/evaluations/:id/publish
 * @access  Private (Instructor/Admin only)
 */
export const publishEvaluation = async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;

    // Find evaluation
    const evaluation = await Evaluation.findById(id).populate(
        'course',
        'instructor'
    );
    if (!evaluation) {
        throw new NotFoundError('Evaluation not found');
    }

    // Check authorization - allow evaluation instructor or course instructor
    const isEvaluationInstructor =
        String(evaluation.instructor) === String(userId);
    const isCourseInstructor =
        String(evaluation.course.instructor) === String(userId);

    if (!isEvaluationInstructor && !isCourseInstructor && role !== 'admin') {
        throw new UnauthorizedError(
            'Only the course instructor can publish evaluations'
        );
    }

    // Can only publish drafts
    if (evaluation.status !== 'draft') {
        throw new BadRequestError('Evaluation is already published or closed');
    }

    // Validate weight is set (allow 0 for optional evaluations)
    if (evaluation.weight === undefined || evaluation.weight === null) {
        throw new BadRequestError('Weight must be set before publishing');
    }

    if (evaluation.weight < 0 || evaluation.weight > 100) {
        throw new BadRequestError('Weight must be between 0 and 100');
    }

    // Ensure there are questions
    const questionCount = await EvaluationQuestion.countDocuments({
        evaluation: id,
    });
    if (questionCount === 0) {
        throw new BadRequestError(
            'At least one question is required before publishing'
        );
    }

    // Publish
    evaluation.status = 'published';
    evaluation.publishedAt = new Date();
    await evaluation.save();

    const questions = await EvaluationQuestion.find({
        evaluation: id,
    }).sort('order');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Evaluation published successfully',
        evaluation: {
            ...evaluation.toObject(),
            questions,
        },
    });
};

/**
 * @desc    Close an evaluation (no more submissions)
 * @route   POST /api/v1/evaluations/:id/close
 * @access  Private (Instructor/Admin only)
 */
export const closeEvaluation = async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;

    const evaluation = await Evaluation.findById(id).populate(
        'course',
        'instructor'
    );
    if (!evaluation) {
        throw new NotFoundError('Evaluation not found');
    }

    // Check authorization - allow evaluation instructor or course instructor
    const isEvaluationInstructor =
        String(evaluation.instructor) === String(userId);
    const isCourseInstructor =
        String(evaluation.course.instructor) === String(userId);

    if (!isEvaluationInstructor && !isCourseInstructor && role !== 'admin') {
        throw new UnauthorizedError(
            'Only the course instructor can close evaluations'
        );
    }

    if (evaluation.status !== 'published') {
        throw new BadRequestError('Only published evaluations can be closed');
    }

    evaluation.status = 'closed';
    evaluation.closedAt = new Date();
    await evaluation.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Evaluation closed successfully',
        evaluation,
    });
};

/**
 * @desc    Get all evaluations for a course (Instructor view with submission counts)
 * @route   GET /api/v1/courses/:courseId/evaluations/instructor
 * @access  Private (Instructor/Admin only)
 */
export const getInstructorEvaluations = async (req, res) => {
    const { courseId } = req.params;
    const { userId, role } = req.user;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Course not found');
    }

    // Check authorization
    if (String(course.instructor) !== String(userId) && role !== 'admin') {
        throw new UnauthorizedError(
            'Only the course instructor can view evaluations'
        );
    }

    // Get evaluations
    const evaluations = await Evaluation.find({
        course: courseId,
        isDeleted: false,
    }).sort('-createdAt');

    // Get submission counts for each evaluation
    const evaluationsWithCounts = await Promise.all(
        evaluations.map(async evaluation => {
            const totalSubmissions = await EvaluationSubmission.countDocuments({
                evaluation: evaluation._id,
            });
            const gradedSubmissions = await EvaluationSubmission.countDocuments(
                {
                    evaluation: evaluation._id,
                    status: 'graded',
                }
            );

            return {
                ...evaluation.toObject(),
                submissionCount: totalSubmissions,
                gradedCount: gradedSubmissions,
            };
        })
    );

    res.status(StatusCodes.OK).json({
        success: true,
        evaluations: evaluationsWithCounts,
    });
};

/**
 * @desc    Get evaluation details with questions (for editing or viewing)
 * @route   GET /api/v1/evaluations/:id
 * @access  Private (Instructor/Admin or enrolled student)
 */
export const getEvaluationById = async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;

    // Find evaluation
    const evaluation = await Evaluation.findById(id).populate(
        'course',
        'title instructor'
    );
    if (!evaluation) {
        throw new NotFoundError('Evaluation not found');
    }

    // Get questions
    const questions = await EvaluationQuestion.find({
        evaluation: id,
    }).sort('order');

    // Check authorization - allow evaluation instructor, course instructor, or admin
    const isEvaluationInstructor =
        String(evaluation.instructor) === String(userId);
    const isCourseInstructor =
        String(evaluation.course.instructor) === String(userId);
    const isInstructor =
        isEvaluationInstructor || isCourseInstructor || role === 'admin';

    if (!isInstructor) {
        // Check if student is enrolled
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: evaluation.course._id,
            status: 'enrolled',
        });

        if (!enrollment) {
            throw new UnauthorizedError(
                'You must be enrolled in this course to view evaluations'
            );
        }

        // Students can only view published evaluations
        if (evaluation.status === 'draft') {
            throw new UnauthorizedError('This evaluation is not yet published');
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        evaluation: {
            ...evaluation.toObject(),
            questions,
        },
    });
};

/**
 * @desc    Get all submissions for an evaluation
 * @route   GET /api/v1/evaluations/:id/submissions
 * @access  Private (Instructor/Admin only)
 */
export const getEvaluationSubmissions = async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;

    // Find evaluation
    const evaluation = await Evaluation.findById(id).populate(
        'course',
        'instructor'
    );
    if (!evaluation) {
        throw new NotFoundError('Evaluation not found');
    }

    // Check authorization - allow evaluation instructor or course instructor
    const isEvaluationInstructor =
        String(evaluation.instructor) === String(userId);
    const isCourseInstructor =
        String(evaluation.course.instructor) === String(userId);

    if (!isEvaluationInstructor && !isCourseInstructor && role !== 'admin') {
        throw new UnauthorizedError(
            'Only the course instructor can view submissions'
        );
    }

    // Get submissions
    const submissions = await EvaluationSubmission.find({
        evaluation: id,
    })
        .populate('student', 'name email')
        .sort('-submittedAt');

    res.status(StatusCodes.OK).json({
        success: true,
        submissions,
    });
};

/**
 * @desc    Submit answers to an evaluation
 * @route   POST /api/v1/evaluations/:id/submit
 * @access  Private (Enrolled students only)
 */
export const submitEvaluation = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { answers } = req.body;

    // Find evaluation
    const evaluation = await Evaluation.findById(id);
    if (!evaluation) {
        throw new NotFoundError('Evaluation not found');
    }

    // Check if evaluation is published
    if (evaluation.status !== 'published') {
        throw new BadRequestError(
            'This evaluation is not open for submissions'
        );
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: evaluation.course,
        status: 'enrolled',
    });

    if (!enrollment) {
        throw new UnauthorizedError(
            'You must be enrolled in this course to submit'
        );
    }

    // Check for existing submission
    const existingSubmission = await EvaluationSubmission.findOne({
        evaluation: id,
        student: userId,
    });

    if (existingSubmission) {
        throw new BadRequestError(
            'You have already submitted this evaluation. Only one submission is allowed.'
        );
    }

    // Validate answers
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        throw new BadRequestError('Answers are required');
    }

    // Get all questions for this evaluation
    const questions = await EvaluationQuestion.find({ evaluation: id });

    if (questions.length === 0) {
        throw new BadRequestError('No questions found for this evaluation');
    }

    // Validate all questions are answered
    if (answers.length !== questions.length) {
        throw new BadRequestError(
            `All ${questions.length} questions must be answered`
        );
    }

    // Validate each answer
    const questionIds = questions.map(q => String(q._id));
    const validatedAnswers = [];

    for (const answer of answers) {
        if (
            !answer.questionId ||
            !questionIds.includes(String(answer.questionId))
        ) {
            throw new BadRequestError('Invalid question ID in answers');
        }

        if (
            !answer.responseText ||
            typeof answer.responseText !== 'string' ||
            answer.responseText.trim().length === 0
        ) {
            throw new BadRequestError(
                'All answers must contain text responses'
            );
        }

        validatedAnswers.push({
            questionId: answer.questionId,
            responseText: answer.responseText.trim(),
        });
    }

    // Create submission
    const submission = await EvaluationSubmission.create({
        evaluation: id,
        student: userId,
        answers: validatedAnswers,
        submittedAt: new Date(),
        status: 'submitted',
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Evaluation submitted successfully',
        submission,
    });
};

/**
 * @desc    Grade a submission
 * @route   POST /api/v1/submissions/:id/grade
 * @access  Private (Instructor/Admin only)
 */
export const gradeSubmission = async (req, res) => {
    const { id } = req.params;
    const { userId, role } = req.user;
    const { totalScore, feedback } = req.body;

    console.log('📝 Grading submission:', {
        submissionId: id,
        totalScore,
        totalScoreType: typeof totalScore,
        feedback: feedback ? 'provided' : 'not provided',
    });

    // Find submission
    const submission = await EvaluationSubmission.findById(id).populate({
        path: 'evaluation',
        select: 'instructor course totalMarks',
        populate: {
            path: 'course',
            select: 'instructor',
        },
    });

    if (!submission) {
        throw new NotFoundError('Submission not found');
    }

    // Check authorization - allow evaluation instructor or course instructor
    const isEvaluationInstructor =
        String(submission.evaluation.instructor) === String(userId);
    const isCourseInstructor =
        String(submission.evaluation.course.instructor) === String(userId);

    if (!isEvaluationInstructor && !isCourseInstructor && role !== 'admin') {
        throw new UnauthorizedError(
            'Only the course instructor can grade submissions'
        );
    }

    // Check if already graded
    if (submission.status === 'graded') {
        throw new BadRequestError(
            'This submission has already been graded and cannot be modified'
        );
    }

    // Validate score
    if (totalScore === undefined || totalScore === null) {
        throw new BadRequestError('Total score is required');
    }

    // Convert to number and validate
    const scoreNum =
        typeof totalScore === 'number' ? totalScore : Number(totalScore);

    if (isNaN(scoreNum)) {
        throw new BadRequestError('Total score must be a valid number');
    }

    if (scoreNum < 0 || scoreNum > submission.evaluation.totalMarks) {
        throw new BadRequestError(
            `Score must be between 0 and ${submission.evaluation.totalMarks}`
        );
    }

    // Update submission
    submission.totalScore = scoreNum;
    submission.feedback = feedback || null;
    submission.gradedBy = userId;
    submission.gradedAt = new Date();
    submission.status = 'graded';
    await submission.save();

    // Recalculate enrollment total score
    await recalculateEnrollmentScore(
        submission.student,
        submission.evaluation.course
    );

    // Check if course is now complete and issue certificate if eligible
    const certificate = await issueCertificateIfComplete(
        submission.student,
        submission.evaluation.course
    );

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Submission graded successfully',
        submission,
        certificateIssued: !!certificate,
    });
};

/**
 * @desc    Get student's own submission for an evaluation
 * @route   GET /api/v1/evaluations/:id/my-submission
 * @access  Private (Students only)
 */
export const getMySubmission = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    // Find evaluation
    const evaluation = await Evaluation.findById(id);
    if (!evaluation) {
        throw new NotFoundError('Evaluation not found');
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: evaluation.course,
        status: 'enrolled',
    });

    if (!enrollment) {
        throw new UnauthorizedError('You must be enrolled in this course');
    }

    // Find submission
    const submission = await EvaluationSubmission.findOne({
        evaluation: id,
        student: userId,
    }).populate({
        path: 'answers.questionId',
        select: 'prompt maxMarks order',
    });

    if (!submission) {
        return res.status(StatusCodes.OK).json({
            success: true,
            submission: null,
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        submission,
    });
};

/**
 * Helper: Recalculate total score for an enrollment
 * Sums up (submissionScore / evaluationTotalMarks * evaluationWeight)
 */
const recalculateEnrollmentScore = async (studentId, courseId) => {
    // Get all evaluations for the course
    const evaluations = await Evaluation.find({
        course: courseId,
        status: { $in: ['published', 'closed'] },
        isDeleted: false,
    });

    // Get all graded submissions for this student
    const submissions = await EvaluationSubmission.find({
        student: studentId,
        evaluation: { $in: evaluations.map(e => e._id) },
        status: 'graded',
    });

    // Calculate weighted score
    let totalScore = 0;

    for (const submission of submissions) {
        const evaluation = evaluations.find(
            e => String(e._id) === String(submission.evaluation)
        );

        if (evaluation && submission.totalScore !== null) {
            // Percentage = (score / totalMarks) * weight
            const percentage =
                (submission.totalScore / evaluation.totalMarks) *
                evaluation.weight;
            totalScore += percentage;
        }
    }

    // Update enrollment
    await Enrollment.findOneAndUpdate(
        { user: studentId, course: courseId },
        { totalScore: Math.round(totalScore * 100) / 100 }
    );

    return totalScore;
};

/**
 * @desc    Get all evaluations for a course (Student view)
 * @route   GET /api/v1/courses/:courseId/evaluations
 * @access  Private (Enrolled students)
 */
export const getStudentEvaluations = async (req, res) => {
    const { courseId } = req.params;
    const { userId } = req.user;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        status: 'enrolled',
    });

    if (!enrollment) {
        throw new UnauthorizedError('You must be enrolled in this course');
    }

    // Get published evaluations
    const evaluations = await Evaluation.find({
        course: courseId,
        status: { $in: ['published', 'closed'] },
        isDeleted: false,
    }).sort('-publishedAt');

    // Get user's submissions
    const submissions = await EvaluationSubmission.find({
        student: userId,
        evaluation: { $in: evaluations.map(e => e._id) },
    });

    const submissionMap = {};
    submissions.forEach(sub => {
        submissionMap[String(sub.evaluation)] = sub;
    });

    // Combine data
    const evaluationsWithStatus = evaluations.map(evaluation => ({
        ...evaluation.toObject(),
        hasSubmitted: !!submissionMap[String(evaluation._id)],
        isGraded: submissionMap[String(evaluation._id)]?.status === 'graded',
        score: submissionMap[String(evaluation._id)]?.totalScore,
    }));

    res.status(StatusCodes.OK).json({
        success: true,
        evaluations: evaluationsWithStatus,
    });
};

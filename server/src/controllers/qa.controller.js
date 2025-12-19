import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { Question, Answer, Vote, Tag, User } from '../models/index.js';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '../errors/index.js';

/**
 * ========================================
 * QUESTIONS CONTROLLERS
 * ========================================
 */

/**
 * GET /api/v1/qa/questions
 * Get all questions with filters, search, and pagination
 */
export const getQuestions = async (req, res) => {
    const { search, tag, sort = 'newest', page = 1, limit = 20 } = req.query;

    const query = { isDeleted: false };

    // Text search (title or body)
    if (search) {
        query.$text = { $search: search };
    }

    // Filter by tag
    if (tag) {
        const tagDoc = await Tag.findOne({ name: tag.toLowerCase() });
        if (tagDoc) {
            query.tags = tagDoc._id;
        } else {
            // No tag found, return empty results
            return res.status(StatusCodes.OK).json({
                success: true,
                questions: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0,
                },
            });
        }
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
        case 'newest':
            sortOption = { createdAt: -1 };
            break;
        case 'votes':
            sortOption = { voteScore: -1, createdAt: -1 };
            break;
        case 'active':
            sortOption = { lastActivityAt: -1 };
            break;
        case 'unanswered':
            query.answerCount = 0;
            sortOption = { createdAt: -1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
        .populate('author', 'name avatar reputation')
        .populate('tags', 'name')
        .populate('acceptedAnswer')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    res.status(StatusCodes.OK).json({
        success: true,
        questions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
};

/**
 * GET /api/v1/qa/questions/:id
 * Get single question with answers
 */
export const getQuestionById = async (req, res) => {
    const { id } = req.params;

    const question = await Question.findById(id)
        .populate('author', 'name avatar reputation')
        .populate('tags', 'name description');

    if (!question || question.isDeleted) {
        throw new NotFoundError('Question not found');
    }

    // Increment view count
    question.viewCount += 1;
    await question.save();

    // Get user's vote on this question (if authenticated)
    let userVote = null;
    if (req.user) {
        const vote = await Vote.findOne({
            voter: req.user.userId,
            targetType: 'Question',
            targetId: id,
        });
        userVote = vote ? vote.value : null;
    }

    res.status(StatusCodes.OK).json({
        success: true,
        question,
        userVote,
    });
};

/**
 * POST /api/v1/qa/questions
 * Create a new question (authenticated)
 */
export const createQuestion = async (req, res) => {
    const { title, body, tags } = req.body;

    if (!title || !body) {
        throw new BadRequestError('Title and body are required');
    }

    // Validate and find/create tags
    const tagIds = [];
    if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
            const trimmedTag = tagName.toLowerCase().trim();
            if (!trimmedTag) continue;

            // Find or create tag
            let tag = await Tag.findOne({ name: trimmedTag });
            if (!tag) {
                tag = await Tag.create({ name: trimmedTag });
            }
            // Increment question count
            tag.questionCount += 1;
            await tag.save();
            tagIds.push(tag._id);
        }
    }

    const question = await Question.create({
        title,
        body,
        author: req.user.userId,
        tags: tagIds,
    });

    const populatedQuestion = await Question.findById(question._id)
        .populate('author', 'name avatar reputation')
        .populate('tags', 'name');

    res.status(StatusCodes.CREATED).json({
        success: true,
        question: populatedQuestion,
    });
};

/**
 * PATCH /api/v1/qa/questions/:id
 * Update question (only by author)
 */
export const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { title, body, tags } = req.body;

    const question = await Question.findById(id);

    if (!question || question.isDeleted) {
        throw new NotFoundError('Question not found');
    }

    // Check authorization
    if (question.author.toString() !== req.user.userId) {
        throw new UnauthorizedError('You can only edit your own questions');
    }

    // Update basic fields
    if (title) question.title = title;
    if (body) question.body = body;

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
        // Decrement old tags
        for (const oldTagId of question.tags) {
            const tag = await Tag.findById(oldTagId);
            if (tag && tag.questionCount > 0) {
                tag.questionCount -= 1;
                await tag.save();
            }
        }

        // Add new tags
        const tagIds = [];
        for (const tagName of tags) {
            const trimmedTag = tagName.toLowerCase().trim();
            if (!trimmedTag) continue;

            let tag = await Tag.findOne({ name: trimmedTag });
            if (!tag) {
                tag = await Tag.create({ name: trimmedTag });
            }
            tag.questionCount += 1;
            await tag.save();
            tagIds.push(tag._id);
        }

        question.tags = tagIds;
    }

    await question.save();

    const updatedQuestion = await Question.findById(id)
        .populate('author', 'name avatar reputation')
        .populate('tags', 'name');

    res.status(StatusCodes.OK).json({
        success: true,
        question: updatedQuestion,
    });
};

/**
 * DELETE /api/v1/qa/questions/:id
 * Soft delete question (only by author or admin)
 */
export const deleteQuestion = async (req, res) => {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question || question.isDeleted) {
        throw new NotFoundError('Question not found');
    }

    // Check authorization
    if (
        question.author.toString() !== req.user.userId &&
        req.user.role !== 'admin'
    ) {
        throw new UnauthorizedError('You can only delete your own questions');
    }

    question.isDeleted = true;
    await question.save();

    // Decrement tag counts
    for (const tagId of question.tags) {
        const tag = await Tag.findById(tagId);
        if (tag && tag.questionCount > 0) {
            tag.questionCount -= 1;
            await tag.save();
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Question deleted successfully',
    });
};

/**
 * ========================================
 * ANSWERS CONTROLLERS
 * ========================================
 */

/**
 * GET /api/v1/qa/questions/:questionId/answers
 * Get all answers for a question
 */
export const getAnswers = async (req, res) => {
    const { questionId } = req.params;
    const { sort = 'votes', page = 1, limit = 20 } = req.query;

    const question = await Question.findById(questionId);
    if (!question || question.isDeleted) {
        throw new NotFoundError('Question not found');
    }

    const query = { question: questionId, isDeleted: false };

    let sortOption = {};
    if (sort === 'votes') {
        sortOption = { isAccepted: -1, voteScore: -1, createdAt: 1 };
    } else {
        sortOption = { isAccepted: -1, createdAt: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Answer.countDocuments(query);

    const answers = await Answer.find(query)
        .populate('author', 'name avatar reputation')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Get user votes on answers (if authenticated)
    let userVotes = {};
    if (req.user) {
        const answerIds = answers.map(a => a._id);
        const votes = await Vote.find({
            voter: req.user.userId,
            targetType: 'Answer',
            targetId: { $in: answerIds },
        });
        votes.forEach(vote => {
            userVotes[vote.targetId.toString()] = vote.value;
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        answers,
        userVotes,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
};

/**
 * POST /api/v1/qa/questions/:questionId/answers
 * Create answer to a question
 */
export const createAnswer = async (req, res) => {
    const { questionId } = req.params;
    const { body } = req.body;

    if (!body) {
        throw new BadRequestError('Answer body is required');
    }

    const question = await Question.findById(questionId);
    if (!question || question.isDeleted) {
        throw new NotFoundError('Question not found');
    }

    const answer = await Answer.create({
        body,
        author: req.user.userId,
        question: questionId,
    });

    // Update question's answer count and last activity
    question.answerCount += 1;
    question.lastActivityAt = new Date();
    await question.save();

    const populatedAnswer = await Answer.findById(answer._id).populate(
        'author',
        'name avatar reputation'
    );

    res.status(StatusCodes.CREATED).json({
        success: true,
        answer: populatedAnswer,
    });
};

/**
 * PATCH /api/v1/qa/answers/:id
 * Update answer (only by author)
 */
export const updateAnswer = async (req, res) => {
    const { id } = req.params;
    const { body } = req.body;

    const answer = await Answer.findById(id);

    if (!answer || answer.isDeleted) {
        throw new NotFoundError('Answer not found');
    }

    // Check authorization
    if (answer.author.toString() !== req.user.userId) {
        throw new UnauthorizedError('You can only edit your own answers');
    }

    // Save edit history
    answer.editHistory.push({
        editedAt: new Date(),
        previousBody: answer.body,
    });

    answer.body = body;
    await answer.save();

    // Update question's last activity
    await Question.findByIdAndUpdate(answer.question, {
        lastActivityAt: new Date(),
    });

    const updatedAnswer = await Answer.findById(id).populate(
        'author',
        'name avatar reputation'
    );

    res.status(StatusCodes.OK).json({
        success: true,
        answer: updatedAnswer,
    });
};

/**
 * DELETE /api/v1/qa/answers/:id
 * Soft delete answer
 */
export const deleteAnswer = async (req, res) => {
    const { id } = req.params;

    const answer = await Answer.findById(id);

    if (!answer || answer.isDeleted) {
        throw new NotFoundError('Answer not found');
    }

    // Check authorization
    if (
        answer.author.toString() !== req.user.userId &&
        req.user.role !== 'admin'
    ) {
        throw new UnauthorizedError('You can only delete your own answers');
    }

    answer.isDeleted = true;
    await answer.save();

    // Update question's answer count
    const question = await Question.findById(answer.question);
    if (question && question.answerCount > 0) {
        question.answerCount -= 1;

        // If this was the accepted answer, unaccept it
        if (question.acceptedAnswer?.toString() === id) {
            question.acceptedAnswer = null;

            // Reverse reputation for answer author
            const answerAuthor = await User.findById(answer.author);
            if (answerAuthor && answerAuthor.reputation >= 10) {
                answerAuthor.reputation -= 10;
                await answerAuthor.save();
            }
        }

        await question.save();
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Answer deleted successfully',
    });
};

/**
 * POST /api/v1/qa/answers/:id/accept
 * Accept answer (only question author)
 */
export const acceptAnswer = async (req, res) => {
    const { id } = req.params;

    const answer = await Answer.findById(id);

    if (!answer || answer.isDeleted) {
        throw new NotFoundError('Answer not found');
    }

    const question = await Question.findById(answer.question);
    if (!question || question.isDeleted) {
        throw new NotFoundError('Question not found');
    }

    // Only question author can accept
    if (question.author.toString() !== req.user.userId) {
        throw new UnauthorizedError(
            'Only the question author can accept answers'
        );
    }

    // Use transaction for reputation updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // If there was a previously accepted answer, unaccept it
        if (question.acceptedAnswer) {
            const prevAnswer = await Answer.findById(question.acceptedAnswer);
            if (prevAnswer) {
                prevAnswer.isAccepted = false;
                await prevAnswer.save({ session });

                // Reverse reputation
                const prevAuthor = await User.findById(prevAnswer.author);
                if (prevAuthor && prevAuthor.reputation >= 10) {
                    prevAuthor.reputation -= 10;
                    await prevAuthor.save({ session });
                }
            }
        }

        // Accept new answer
        answer.isAccepted = true;
        await answer.save({ session });

        question.acceptedAnswer = answer._id;
        await question.save({ session });

        // Award reputation (+10 for accepted answer)
        const answerAuthor = await User.findById(answer.author);
        if (answerAuthor) {
            answerAuthor.reputation += 10;
            await answerAuthor.save({ session });
        }

        await session.commitTransaction();

        const updatedAnswer = await Answer.findById(id).populate(
            'author',
            'name avatar reputation'
        );

        res.status(StatusCodes.OK).json({
            success: true,
            answer: updatedAnswer,
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * DELETE /api/v1/qa/answers/:id/accept
 * Unaccept answer (only question author)
 */
export const unacceptAnswer = async (req, res) => {
    const { id } = req.params;

    const answer = await Answer.findById(id);

    if (!answer || answer.isDeleted) {
        throw new NotFoundError('Answer not found');
    }

    if (!answer.isAccepted) {
        throw new BadRequestError('Answer is not accepted');
    }

    const question = await Question.findById(answer.question);
    if (!question || question.isDeleted) {
        throw new NotFoundError('Question not found');
    }

    // Only question author can unaccept
    if (question.author.toString() !== req.user.userId) {
        throw new UnauthorizedError(
            'Only the question author can unaccept answers'
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        answer.isAccepted = false;
        await answer.save({ session });

        question.acceptedAnswer = null;
        await question.save({ session });

        // Reverse reputation
        const answerAuthor = await User.findById(answer.author);
        if (answerAuthor && answerAuthor.reputation >= 10) {
            answerAuthor.reputation -= 10;
            await answerAuthor.save({ session });
        }

        await session.commitTransaction();

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Answer unaccepted',
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * ========================================
 * VOTING CONTROLLERS
 * ========================================
 */

/**
 * POST /api/v1/qa/vote
 * Vote on question or answer
 * Body: { targetType: 'Question'|'Answer', targetId: string, value: 1|-1 }
 */
export const vote = async (req, res) => {
    const { targetType, targetId, value } = req.body;

    // Validation
    if (!targetType || !targetId || !value) {
        throw new BadRequestError(
            'targetType, targetId, and value are required'
        );
    }

    if (!['Question', 'Answer'].includes(targetType)) {
        throw new BadRequestError('targetType must be Question or Answer');
    }

    if (![1, -1].includes(value)) {
        throw new BadRequestError('value must be 1 (upvote) or -1 (downvote)');
    }

    // Check if target exists
    const Model = targetType === 'Question' ? Question : Answer;
    const target = await Model.findById(targetId);

    if (!target || target.isDeleted) {
        throw new NotFoundError(`${targetType} not found`);
    }

    // Prevent self-voting
    if (target.author.toString() === req.user.userId) {
        throw new BadRequestError('You cannot vote on your own content');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check for existing vote
        const existingVote = await Vote.findOne({
            voter: req.user.userId,
            targetType,
            targetId,
        });

        let reputationChange = 0;

        if (existingVote) {
            // If clicking the same vote, remove it (toggle off)
            if (existingVote.value === value) {
                await Vote.deleteOne({ _id: existingVote._id }, { session });
                target.voteScore -= value;
                reputationChange = value === 1 ? -5 : 2; // Reverse reputation
            } else {
                // Change vote direction
                existingVote.value = value;
                await existingVote.save({ session });
                target.voteScore += value * 2; // Change from -1 to +1 or vice versa
                reputationChange = value === 1 ? 7 : -7; // (+5) - (-2) = 7 or vice versa
            }
        } else {
            // New vote
            await Vote.create(
                [
                    {
                        voter: req.user.userId,
                        targetType,
                        targetId,
                        value,
                    },
                ],
                { session }
            );
            target.voteScore += value;
            reputationChange = value === 1 ? 5 : -2;
        }

        await target.save({ session });

        // Update author's reputation
        const author = await User.findById(target.author);
        if (author) {
            author.reputation = Math.max(
                0,
                author.reputation + reputationChange
            );
            await author.save({ session });
        }

        await session.commitTransaction();

        res.status(StatusCodes.OK).json({
            success: true,
            voteScore: target.voteScore,
            userVote:
                existingVote && existingVote.value === value ? null : value,
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * ========================================
 * TAGS CONTROLLERS
 * ========================================
 */

/**
 * GET /api/v1/qa/tags
 * Get all tags with pagination and search
 */
export const getTags = async (req, res) => {
    const { search, sort = 'popular', page = 1, limit = 30 } = req.query;

    const query = {};

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    let sortOption = {};
    if (sort === 'popular') {
        sortOption = { questionCount: -1 };
    } else if (sort === 'name') {
        sortOption = { name: 1 };
    } else {
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Tag.countDocuments(query);

    const tags = await Tag.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

    res.status(StatusCodes.OK).json({
        success: true,
        tags,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
};

/**
 * GET /api/v1/qa/tags/:name
 * Get single tag details
 */
export const getTagByName = async (req, res) => {
    const { name } = req.params;

    const tag = await Tag.findOne({ name: name.toLowerCase() });

    if (!tag) {
        throw new NotFoundError('Tag not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        tag,
    });
};

/**
 * ========================================
 * USER Q&A STATS
 * ========================================
 */

/**
 * GET /api/v1/qa/users/:userId/stats
 * Get user's Q&A statistics
 */
export const getUserStats = async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select('name avatar reputation');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const questionCount = await Question.countDocuments({
        author: userId,
        isDeleted: false,
    });

    const answerCount = await Answer.countDocuments({
        author: userId,
        isDeleted: false,
    });

    const acceptedAnswerCount = await Answer.countDocuments({
        author: userId,
        isAccepted: true,
        isDeleted: false,
    });

    res.status(StatusCodes.OK).json({
        success: true,
        stats: {
            user,
            reputation: user.reputation,
            questionCount,
            answerCount,
            acceptedAnswerCount,
        },
    });
};

/**
 * GET /api/v1/qa/users/me/questions
 * Get current user's questions
 */
export const getMyQuestions = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const query = {
        author: req.user.userId,
        isDeleted: false,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
        .populate('tags', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.status(StatusCodes.OK).json({
        success: true,
        questions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
};

/**
 * GET /api/v1/qa/users/me/answers
 * Get current user's answers
 */
export const getMyAnswers = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const query = {
        author: req.user.userId,
        isDeleted: false,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Answer.countDocuments(query);

    const answers = await Answer.find(query)
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.status(StatusCodes.OK).json({
        success: true,
        answers,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
};

/**
 * Global Search Service
 *
 * Implements keyword-based search across multiple entities:
 * - Courses
 * - Q&A Questions
 * - Posts
 * - Users
 * - Skill Swap Requests
 *
 * Strategy:
 * - MongoDB text indexes for full-text search on primary fields
 * - Regex for partial matching on titles/names
 * - Efficient pagination and filtering
 * - No vector/semantic search (traditional keyword-based only)
 */

import Course from '#models/Course.js';
import Question from '#models/Question.js';
import Post from '#models/Post.js';
import User from '#models/User.js';
import SkillSwapRequest from '#models/SkillSwapRequest.js';

/**
 * Build a case-insensitive regex pattern for partial keyword matching
 * @param {string} query - Search query
 * @returns {RegExp} - MongoDB-compatible regex
 */
const buildSearchRegex = query => {
    // Escape special regex characters
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
};

/**
 * Search Courses
 * Fields: title, description, category, skillTags
 * Filters: skills, priceMin, priceMax, level, instructor
 */
export const searchCourses = async (query, filters = {}, options = {}) => {
    const {
        skills = [],
        priceMin,
        priceMax,
        level,
        instructor,
        status = 'approved', // Only approved courses by default
    } = filters;

    const {
        page = 1,
        limit = 10,
        sortBy = 'relevance', // relevance, newest, popular, price
    } = options;

    const searchConditions = [];

    // Keyword search across multiple fields
    if (query && query.trim()) {
        const regex = buildSearchRegex(query.trim());
        searchConditions.push({
            $or: [
                { title: regex },
                { description: regex },
                { category: regex },
                { skillTags: { $in: [regex] } },
            ],
        });
    }

    // Skill tags filter (exact match on array elements)
    if (skills.length > 0) {
        searchConditions.push({
            skillTags: { $in: skills },
        });
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
        const priceFilter = {};
        if (priceMin !== undefined) priceFilter.$gte = Number(priceMin);
        if (priceMax !== undefined) priceFilter.$lte = Number(priceMax);
        searchConditions.push({ pricePoints: priceFilter });
    }

    // Level filter
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
        searchConditions.push({ level });
    }

    // Instructor filter
    if (instructor) {
        searchConditions.push({ instructor });
    }

    // Status filter (approved/published courses only)
    searchConditions.push({ status, isPublished: true });

    // Build final query
    const finalQuery =
        searchConditions.length > 0 ? { $and: searchConditions } : {};

    // Sorting logic
    let sort = {};
    switch (sortBy) {
        case 'newest':
            sort = { createdAt: -1 };
            break;
        case 'popular':
            sort = { enrollCount: -1 };
            break;
        case 'price':
            sort = { pricePoints: 1 };
            break;
        default: // relevance
            sort = { enrollCount: -1, createdAt: -1 }; // Popular + recent
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
        Course.find(finalQuery)
            .populate('instructor', 'name email avatar')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Course.countDocuments(finalQuery),
    ]);

    return {
        data: courses,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Search Q&A Questions
 * Fields: title, body, tags
 * Filters: tags, minVotes, hasAcceptedAnswer
 */
export const searchQuestions = async (query, filters = {}, options = {}) => {
    const { tags = [], minVotes, hasAcceptedAnswer } = filters;

    const {
        page = 1,
        limit = 10,
        sortBy = 'relevance', // relevance, newest, votes, active
    } = options;

    const searchConditions = [{ isDeleted: false }];

    // Keyword search
    if (query && query.trim()) {
        const regex = buildSearchRegex(query.trim());
        searchConditions.push({
            $or: [{ title: regex }, { body: regex }],
        });
    }

    // Tag filter
    if (tags.length > 0) {
        searchConditions.push({
            tags: { $in: tags },
        });
    }

    // Min votes filter
    if (minVotes !== undefined) {
        searchConditions.push({
            voteScore: { $gte: Number(minVotes) },
        });
    }

    // Accepted answer filter
    if (hasAcceptedAnswer !== undefined) {
        if (hasAcceptedAnswer) {
            searchConditions.push({ acceptedAnswer: { $ne: null } });
        } else {
            searchConditions.push({ acceptedAnswer: null });
        }
    }

    const finalQuery = { $and: searchConditions };

    // Sorting
    let sort = {};
    switch (sortBy) {
        case 'newest':
            sort = { createdAt: -1 };
            break;
        case 'votes':
            sort = { voteScore: -1 };
            break;
        case 'active':
            sort = { lastActivityAt: -1 };
            break;
        default: // relevance
            sort = { voteScore: -1, lastActivityAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
        Question.find(finalQuery)
            .populate('author', 'name avatar')
            .populate('tags', 'name')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Question.countDocuments(finalQuery),
    ]);

    return {
        data: questions,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Search Posts
 * Fields: text, user name
 */
export const searchPosts = async (query, filters = {}, options = {}) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'newest', // newest, popular
    } = options;

    const searchConditions = [];

    // Keyword search
    if (query && query.trim()) {
        const regex = buildSearchRegex(query.trim());
        searchConditions.push({
            text: regex,
        });
    }

    const finalQuery =
        searchConditions.length > 0 ? { $and: searchConditions } : {};

    // Sorting
    const sort =
        sortBy === 'popular'
            ? { likes: -1, createdAt: -1 } // Sort by likes count (array length)
            : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.find(finalQuery)
            .populate('user', 'name avatar')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Post.countDocuments(finalQuery),
    ]);

    return {
        data: posts,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Search Users
 * Fields: name, email, bio, interests, institution, fieldOfStudy
 * Filters: role, country
 */
export const searchUsers = async (query, filters = {}, options = {}) => {
    const { role, country } = filters;

    const { page = 1, limit = 10 } = options;

    const searchConditions = [];

    // Keyword search across user fields
    if (query && query.trim()) {
        const regex = buildSearchRegex(query.trim());
        searchConditions.push({
            $or: [
                { name: regex },
                { email: regex },
                { bio: regex },
                { interests: { $in: [regex] } },
                { institution: regex },
                { fieldOfStudy: regex },
            ],
        });
    }

    // Role filter
    if (
        role &&
        ['student', 'instructor', 'admin', 'moderator'].includes(role)
    ) {
        searchConditions.push({ role });
    }

    // Country filter
    if (country) {
        searchConditions.push({ country });
    }

    const finalQuery =
        searchConditions.length > 0 ? { $and: searchConditions } : {};

    const skip = (page - 1) * limit;

    // Don't expose password or sensitive data
    const [users, total] = await Promise.all([
        User.find(finalQuery)
            .select('-password -refreshTokens')
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(finalQuery),
    ]);

    return {
        data: users,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Search Skill Swap Requests
 * Fields: associated course titles, user names
 * Filters: status
 */
export const searchSkillSwaps = async (query, filters = {}, options = {}) => {
    const { status } = filters;

    const { page = 1, limit = 10 } = options;

    const searchConditions = [];

    // Status filter
    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
        searchConditions.push({ status });
    }

    const finalQuery =
        searchConditions.length > 0 ? { $and: searchConditions } : {};

    const skip = (page - 1) * limit;

    // For skill swaps, keyword search is limited since we need to search in populated fields
    // We'll fetch and then filter in memory if query exists
    let skillSwaps = await SkillSwapRequest.find(finalQuery)
        .populate('fromUser', 'name avatar')
        .populate('toUser', 'name avatar')
        .populate('offeredCourse', 'title')
        .populate('requestedCourse', 'title')
        .sort({ createdAt: -1 })
        .lean();

    const total = await SkillSwapRequest.countDocuments(finalQuery);

    // Client-side filtering for course titles if query exists
    // Note: This is not ideal for large datasets, but skill swaps are typically few
    if (query && query.trim()) {
        const regex = buildSearchRegex(query.trim());
        skillSwaps = skillSwaps.filter(
            swap =>
                regex.test(swap.offeredCourse?.title || '') ||
                regex.test(swap.requestedCourse?.title || '') ||
                regex.test(swap.fromUser?.name || '') ||
                regex.test(swap.toUser?.name || '')
        );
    }

    // Apply pagination after filtering
    const paginatedSwaps = skillSwaps.slice(skip, skip + limit);

    return {
        data: paginatedSwaps,
        pagination: {
            total: skillSwaps.length,
            page,
            limit,
            pages: Math.ceil(skillSwaps.length / limit),
        },
    };
};

/**
 * Unified Search - Search across all entities
 * Returns aggregated results grouped by entity type
 */
export const unifiedSearch = async (query, filters = {}, options = {}) => {
    const {
        entities = ['courses', 'questions', 'posts', 'users', 'skillSwaps'], // Which entities to search
    } = filters;

    const {
        page = 1,
        limit = 5, // Limit per entity for preview
    } = options;

    const searchOptions = { page, limit };

    // Execute searches in parallel for performance
    const searches = [];

    if (entities.includes('courses')) {
        searches.push(
            searchCourses(query, filters, searchOptions)
                .then(result => ({ type: 'courses', ...result }))
                .catch(err => ({
                    type: 'courses',
                    error: err.message,
                    data: [],
                    pagination: {},
                }))
        );
    }

    if (entities.includes('questions')) {
        searches.push(
            searchQuestions(query, filters, searchOptions)
                .then(result => ({ type: 'questions', ...result }))
                .catch(err => ({
                    type: 'questions',
                    error: err.message,
                    data: [],
                    pagination: {},
                }))
        );
    }

    if (entities.includes('posts')) {
        searches.push(
            searchPosts(query, filters, searchOptions)
                .then(result => ({ type: 'posts', ...result }))
                .catch(err => ({
                    type: 'posts',
                    error: err.message,
                    data: [],
                    pagination: {},
                }))
        );
    }

    if (entities.includes('users')) {
        searches.push(
            searchUsers(query, filters, searchOptions)
                .then(result => ({ type: 'users', ...result }))
                .catch(err => ({
                    type: 'users',
                    error: err.message,
                    data: [],
                    pagination: {},
                }))
        );
    }

    if (entities.includes('skillSwaps')) {
        searches.push(
            searchSkillSwaps(query, filters, searchOptions)
                .then(result => ({ type: 'skillSwaps', ...result }))
                .catch(err => ({
                    type: 'skillSwaps',
                    error: err.message,
                    data: [],
                    pagination: {},
                }))
        );
    }

    const results = await Promise.all(searches);

    // Calculate total results across all entities
    const totalResults = results.reduce(
        (sum, r) => sum + (r.pagination?.total || 0),
        0
    );

    return {
        query,
        results,
        totalResults,
    };
};

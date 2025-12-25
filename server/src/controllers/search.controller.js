/**
 * Search Controller
 * Handles all search-related HTTP requests
 */

import { StatusCodes } from 'http-status-codes';
import * as searchService from '#services/search.service.js';
import {
    unifiedSearchSchema,
    courseSearchSchema,
    questionSearchSchema,
    postSearchSchema,
    userSearchSchema,
    skillSwapSearchSchema,
} from '#validations/search.validation.js';

/**
 * @route   GET /api/v1/search
 * @desc    Unified search across all entities
 * @access  Public
 */
export const unifiedSearch = async (req, res) => {
    // Validate request
    const validated = unifiedSearchSchema.parse(req.query);
    const { query, entities, page, limit } = validated;

    const results = await searchService.unifiedSearch(
        query,
        { entities },
        { page, limit }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        query,
        totalResults: results.totalResults,
        results: results.results,
    });
};

/**
 * @route   GET /api/v1/search/courses
 * @desc    Search courses with filters
 * @access  Public
 */
export const searchCourses = async (req, res) => {
    const validated = courseSearchSchema.parse(req.query);
    const {
        query,
        page,
        limit,
        sortBy,
        skills,
        priceMin,
        priceMax,
        level,
        instructor,
    } = validated;

    const results = await searchService.searchCourses(
        query,
        { skills, priceMin, priceMax, level, instructor },
        { page, limit, sortBy }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        query,
        ...results,
    });
};

/**
 * @route   GET /api/v1/search/questions
 * @desc    Search Q&A questions with filters
 * @access  Public
 */
export const searchQuestions = async (req, res) => {
    const validated = questionSearchSchema.parse(req.query);
    const { query, page, limit, sortBy, tags, minVotes, hasAcceptedAnswer } =
        validated;

    const results = await searchService.searchQuestions(
        query,
        { tags, minVotes, hasAcceptedAnswer },
        { page, limit, sortBy }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        query,
        ...results,
    });
};

/**
 * @route   GET /api/v1/search/posts
 * @desc    Search posts
 * @access  Public
 */
export const searchPosts = async (req, res) => {
    const validated = postSearchSchema.parse(req.query);
    const { query, page, limit, sortBy } = validated;

    const results = await searchService.searchPosts(
        query,
        {},
        { page, limit, sortBy }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        query,
        ...results,
    });
};

/**
 * @route   GET /api/v1/search/users
 * @desc    Search users with filters
 * @access  Public
 */
export const searchUsers = async (req, res) => {
    const validated = userSearchSchema.parse(req.query);
    const { query, page, limit, role, country } = validated;

    const results = await searchService.searchUsers(
        query,
        { role, country },
        { page, limit }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        query,
        ...results,
    });
};

/**
 * @route   GET /api/v1/search/skill-swaps
 * @desc    Search skill swap requests
 * @access  Public
 */
export const searchSkillSwaps = async (req, res) => {
    const validated = skillSwapSearchSchema.parse(req.query);
    const { query, page, limit, status } = validated;

    const results = await searchService.searchSkillSwaps(
        query,
        { status },
        { page, limit }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        query,
        ...results,
    });
};

/**
 * @route   GET /api/v1/search/suggestions
 * @desc    Get search suggestions/autocomplete (instant search)
 * @access  Public
 */
export const getSearchSuggestions = async (req, res) => {
    const { query = '' } = req.query;

    if (!query || query.trim().length < 2) {
        return res.status(StatusCodes.OK).json({
            success: true,
            suggestions: [],
        });
    }

    // Limit to 3 results per entity for instant preview
    const results = await searchService.unifiedSearch(
        query,
        { entities: ['courses', 'questions', 'posts', 'users'] },
        { page: 1, limit: 3 }
    );

    res.status(StatusCodes.OK).json({
        success: true,
        query,
        suggestions: results.results,
        totalResults: results.totalResults,
    });
};

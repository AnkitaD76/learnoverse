/**
 * Search Routes
 * All search-related API endpoints
 */

import express from 'express';
import * as searchController from '#controllers/search.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = express.Router();

/**
 * @route   GET /api/v1/search
 * @desc    Unified search across all entities
 * @access  Public
 */
router.get('/', asyncHandler(searchController.unifiedSearch));

/**
 * @route   GET /api/v1/search/suggestions
 * @desc    Get instant search suggestions (autocomplete)
 * @access  Public
 */
router.get('/suggestions', asyncHandler(searchController.getSearchSuggestions));

/**
 * @route   GET /api/v1/search/courses
 * @desc    Search courses with filters
 * @access  Public
 */
router.get('/courses', asyncHandler(searchController.searchCourses));

/**
 * @route   GET /api/v1/search/questions
 * @desc    Search Q&A questions
 * @access  Public
 */
router.get('/questions', asyncHandler(searchController.searchQuestions));

/**
 * @route   GET /api/v1/search/posts
 * @desc    Search posts
 * @access  Public
 */
router.get('/posts', asyncHandler(searchController.searchPosts));

/**
 * @route   GET /api/v1/search/users
 * @desc    Search users
 * @access  Public
 */
router.get('/users', asyncHandler(searchController.searchUsers));

/**
 * @route   GET /api/v1/search/skill-swaps
 * @desc    Search skill swap requests
 * @access  Public
 */
router.get('/skill-swaps', asyncHandler(searchController.searchSkillSwaps));

export default router;

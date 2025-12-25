/**
 * Search API Client
 * Handles all search-related API calls
 */

import client from './client';

/**
 * Unified search across all entities
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - Search results grouped by entity type
 */
export const unifiedSearch = async (query, options = {}) => {
  const {
    entities = ['courses', 'questions', 'posts', 'users', 'skillSwaps'],
    page = 1,
    limit = 5,
  } = options;

  const params = new URLSearchParams({
    query: query || '',
    entities: entities.join(','),
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await client.get(`/search?${params}`);
  return response.data;
};

/**
 * Get instant search suggestions for autocomplete
 * @param {string} query - Search query (min 2 chars)
 * @returns {Promise<Object>} - Preview results across entities
 */
export const getSearchSuggestions = async query => {
  if (!query || query.trim().length < 2) {
    return { success: true, suggestions: [], totalResults: 0 };
  }

  const params = new URLSearchParams({
    query: query.trim(),
  });

  const response = await client.get(`/search/suggestions?${params}`);
  return response.data;
};

/**
 * Search courses with advanced filters
 * @param {string} query - Search query
 * @param {Object} filters - Course filters
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} - Course search results
 */
export const searchCourses = async (query, filters = {}, options = {}) => {
  const { skills = [], priceMin, priceMax, level, instructor } = filters;

  const { page = 1, limit = 10, sortBy = 'relevance' } = options;

  const params = new URLSearchParams({
    query: query || '',
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });

  if (skills.length > 0) {
    params.append('skills', skills.join(','));
  }
  if (priceMin !== undefined) {
    params.append('priceMin', priceMin.toString());
  }
  if (priceMax !== undefined) {
    params.append('priceMax', priceMax.toString());
  }
  if (level) {
    params.append('level', level);
  }
  if (instructor) {
    params.append('instructor', instructor);
  }

  const response = await client.get(`/search/courses?${params}`);
  return response.data;
};

/**
 * Search Q&A questions
 * @param {string} query - Search query
 * @param {Object} filters - Question filters
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} - Question search results
 */
export const searchQuestions = async (query, filters = {}, options = {}) => {
  const { tags = [], minVotes, hasAcceptedAnswer } = filters;

  const { page = 1, limit = 10, sortBy = 'relevance' } = options;

  const params = new URLSearchParams({
    query: query || '',
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });

  if (tags.length > 0) {
    params.append('tags', tags.join(','));
  }
  if (minVotes !== undefined) {
    params.append('minVotes', minVotes.toString());
  }
  if (hasAcceptedAnswer !== undefined) {
    params.append('hasAcceptedAnswer', hasAcceptedAnswer.toString());
  }

  const response = await client.get(`/search/questions?${params}`);
  return response.data;
};

/**
 * Search posts
 * @param {string} query - Search query
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} - Post search results
 */
export const searchPosts = async (query, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'newest' } = options;

  const params = new URLSearchParams({
    query: query || '',
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });

  const response = await client.get(`/search/posts?${params}`);
  return response.data;
};

/**
 * Search users
 * @param {string} query - Search query
 * @param {Object} filters - User filters
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - User search results
 */
export const searchUsers = async (query, filters = {}, options = {}) => {
  const { role, country } = filters;

  const { page = 1, limit = 10 } = options;

  const params = new URLSearchParams({
    query: query || '',
    page: page.toString(),
    limit: limit.toString(),
  });

  if (role) {
    params.append('role', role);
  }
  if (country) {
    params.append('country', country);
  }

  const response = await client.get(`/search/users?${params}`);
  return response.data;
};

/**
 * Search skill swap requests
 * @param {string} query - Search query
 * @param {Object} filters - Skill swap filters
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Skill swap search results
 */
export const searchSkillSwaps = async (query, filters = {}, options = {}) => {
  const { status } = filters;

  const { page = 1, limit = 10 } = options;

  const params = new URLSearchParams({
    query: query || '',
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  const response = await client.get(`/search/skill-swaps?${params}`);
  return response.data;
};

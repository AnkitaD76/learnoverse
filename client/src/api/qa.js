import apiClient from './client';

/**
 * Q&A API Client
 * Handles all API calls for the community Q&A system
 */

// ========================================
// QUESTIONS
// ========================================

/**
 * Get all questions with filters
 * @param {Object} params - { search, tag, sort, page, limit }
 */
export const getQuestions = async (params = {}) => {
  const response = await apiClient.get('/qa/questions', { params });
  return response.data;
};

/**
 * Get single question by ID
 * @param {string} id - Question ID
 */
export const getQuestionById = async id => {
  const response = await apiClient.get(`/qa/questions/${id}`);
  return response.data;
};

/**
 * Create a new question
 * @param {Object} data - { title, body, tags: [] }
 */
export const createQuestion = async data => {
  const response = await apiClient.post('/qa/questions', data);
  return response.data;
};

/**
 * Update a question
 * @param {string} id - Question ID
 * @param {Object} data - { title?, body?, tags?: [] }
 */
export const updateQuestion = async (id, data) => {
  const response = await apiClient.patch(`/qa/questions/${id}`, data);
  return response.data;
};

/**
 * Delete a question
 * @param {string} id - Question ID
 */
export const deleteQuestion = async id => {
  const response = await apiClient.delete(`/qa/questions/${id}`);
  return response.data;
};

// ========================================
// ANSWERS
// ========================================

/**
 * Get all answers for a question
 * @param {string} questionId - Question ID
 * @param {Object} params - { sort, page, limit }
 */
export const getAnswers = async (questionId, params = {}) => {
  const response = await apiClient.get(`/qa/questions/${questionId}/answers`, {
    params,
  });
  return response.data;
};

/**
 * Create an answer
 * @param {string} questionId - Question ID
 * @param {Object} data - { body }
 */
export const createAnswer = async (questionId, data) => {
  const response = await apiClient.post(
    `/qa/questions/${questionId}/answers`,
    data
  );
  return response.data;
};

/**
 * Update an answer
 * @param {string} answerId - Answer ID
 * @param {Object} data - { body }
 */
export const updateAnswer = async (answerId, data) => {
  const response = await apiClient.patch(`/qa/answers/${answerId}`, data);
  return response.data;
};

/**
 * Delete an answer
 * @param {string} answerId - Answer ID
 */
export const deleteAnswer = async answerId => {
  const response = await apiClient.delete(`/qa/answers/${answerId}`);
  return response.data;
};

/**
 * Accept an answer
 * @param {string} answerId - Answer ID
 */
export const acceptAnswer = async answerId => {
  const response = await apiClient.post(`/qa/answers/${answerId}/accept`);
  return response.data;
};

/**
 * Unaccept an answer
 * @param {string} answerId - Answer ID
 */
export const unacceptAnswer = async answerId => {
  const response = await apiClient.delete(`/qa/answers/${answerId}/accept`);
  return response.data;
};

// ========================================
// VOTING
// ========================================

/**
 * Vote on a question or answer
 * @param {Object} data - { targetType: 'Question'|'Answer', targetId, value: 1|-1 }
 */
export const vote = async data => {
  const response = await apiClient.post('/qa/vote', data);
  return response.data;
};

// ========================================
// TAGS
// ========================================

/**
 * Get all tags
 * @param {Object} params - { search, sort, page, limit }
 */
export const getTags = async (params = {}) => {
  const response = await apiClient.get('/qa/tags', { params });
  return response.data;
};

/**
 * Get tag by name
 * @param {string} name - Tag name
 */
export const getTagByName = async name => {
  const response = await apiClient.get(`/qa/tags/${name}`);
  return response.data;
};

// ========================================
// USER STATS
// ========================================

/**
 * Get user's Q&A statistics
 * @param {string} userId - User ID
 */
export const getUserStats = async userId => {
  const response = await apiClient.get(`/qa/users/${userId}/stats`);
  return response.data;
};

/**
 * Get my questions
 * @param {Object} params - { page, limit }
 */
export const getMyQuestions = async (params = {}) => {
  const response = await apiClient.get('/qa/users/me/questions', { params });
  return response.data;
};

/**
 * Get my answers
 * @param {Object} params - { page, limit }
 */
export const getMyAnswers = async (params = {}) => {
  const response = await apiClient.get('/qa/users/me/answers', { params });
  return response.data;
};

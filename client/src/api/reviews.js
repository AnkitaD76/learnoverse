import client from './client.js';

// Create a review for a course
export const createReview = async (
  courseId,
  courseRating,
  instructorRating,
  reviewText = ''
) => {
  const response = await client.post('/reviews', {
    courseId,
    courseRating,
    instructorRating,
    reviewText,
  });
  return response.data;
};

// Update user's review
export const updateReview = async (reviewId, updates) => {
  const response = await client.patch(`/reviews/${reviewId}`, updates);
  return response.data;
};

// Delete user's review
export const deleteReview = async reviewId => {
  const response = await client.delete(`/reviews/${reviewId}`);
  return response.data;
};

// Get all reviews for a course
export const getCourseReviews = async (
  courseId,
  { page = 1, limit = 10, sortBy = 'newest' } = {}
) => {
  const response = await client.get(`/reviews/course/${courseId}`, {
    params: { page, limit, sortBy },
  });
  return response.data;
};

// Get user's review for a specific course
export const getUserReview = async courseId => {
  const response = await client.get(`/reviews/my-review/${courseId}`);
  return response.data;
};

// Mark review as helpful or not helpful
export const markReviewHelpful = async (reviewId, helpful) => {
  const response = await client.patch(`/reviews/${reviewId}/helpful`, {
    helpful,
  });
  return response.data;
};

// Get rating distribution for a course
export const getRatingDistribution = async courseId => {
  const response = await client.get(`/reviews/course/${courseId}/distribution`);
  return response.data;
};

// Admin: Delete any review
export const adminDeleteReview = async reviewId => {
  const response = await client.delete(`/reviews/admin/${reviewId}`);
  return response.data;
};

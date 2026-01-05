import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import {
  getCourseReviews,
  markReviewHelpful,
  deleteReview as deleteReviewAPI,
  adminDeleteReview,
} from '../api/reviews';
import { useSession } from '../contexts/SessionContext';

/**
 * ReviewList Component
 * Displays paginated list of reviews with sorting and filtering
 *
 * @param {string} courseId - Course ID to fetch reviews for
 * @param {function} onReviewDeleted - Callback when review is deleted
 * @param {boolean} isOwner - Whether current user is the course owner
 */
const ReviewList = ({ courseId, onReviewDeleted, isOwner = false }) => {
  const { user } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const limit = 10;

  // Fetch reviews
  const fetchReviews = async (pageNum = 1, sort = sortBy, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const response = await getCourseReviews(courseId, {
        page: pageNum,
        limit,
        sortBy: sort,
      });

      if (append) {
        setReviews(prev => [...prev, ...response.reviews]);
      } else {
        setReviews(response.reviews);
      }

      setPagination(response.pagination);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchReviews(1, sortBy, false);
    }
  }, [courseId, sortBy]);

  const handleSortChange = newSort => {
    setSortBy(newSort);
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages) {
      fetchReviews(page + 1, sortBy, true);
    }
  };

  const handleMarkHelpful = async (reviewId, helpful) => {
    try {
      await markReviewHelpful(reviewId, helpful);

      // Update local state
      setReviews(prev =>
        prev.map(review => {
          if (review._id === reviewId) {
            // Optimistically update counts
            const currentUserId = user?._id;
            const wasHelpful = review.helpfulBy?.includes(currentUserId);
            const wasNotHelpful = review.notHelpfulBy?.includes(currentUserId);

            let newHelpfulCount = review.helpfulCount || 0;
            let newNotHelpfulCount = review.notHelpfulCount || 0;

            if (wasHelpful) newHelpfulCount--;
            if (wasNotHelpful) newNotHelpfulCount--;

            if (helpful) {
              newHelpfulCount++;
            } else {
              newNotHelpfulCount++;
            }

            return {
              ...review,
              helpfulCount: Math.max(0, newHelpfulCount),
              notHelpfulCount: Math.max(0, newNotHelpfulCount),
            };
          }
          return review;
        })
      );
    } catch (err) {
      console.error('Failed to mark review:', err);
    }
  };

  const handleDelete = async reviewId => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      // Find the review to check if user is the author
      const reviewToDelete = reviews.find(r => r._id === reviewId);
      const isAuthor = String(reviewToDelete?.user?._id) === String(user?._id);
      const isAdmin = user?.role === 'admin';

      // Use admin delete endpoint if admin (for any review)
      // Use regular delete endpoint if user is deleting their own review
      if (isAdmin) {
        await adminDeleteReview(reviewId);
      } else if (isAuthor) {
        await deleteReviewAPI(reviewId);
      } else {
        throw new Error('You can only delete your own reviews');
      }

      // Remove from local state
      setReviews(prev => prev.filter(review => review._id !== reviewId));

      // Update pagination count
      if (pagination) {
        setPagination({
          ...pagination,
          totalReviews: pagination.totalReviews - 1,
        });
      }

      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Sort */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Student Reviews
          {pagination && (
            <span className="ml-2 text-base font-normal text-gray-600">
              ({pagination.totalReviews})
            </span>
          )}
        </h3>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => handleSortChange(e.target.value)}
            className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
          <ChevronDown
            size={20}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">
            No reviews yet. Be the first to review!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              onDelete={handleDelete}
              onMarkHelpful={handleMarkHelpful}
              currentUserId={user?._id}
              isAdmin={user?.role === 'admin'}
              isCourseOwner={isOwner}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {pagination && page < pagination.totalPages && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;

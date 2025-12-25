import React, { useState, useContext } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import StarRating from './StarRating';
// import { SessionContext } from '../contexts/SessionContext';
import { formatDistanceToNow } from 'date-fns';

/**
 * ReviewCard Component
 * Displays a single review with ratings, text, and interaction buttons
 *
 * @param {object} review - Review object with all fields
 * @param {function} onEdit - Edit callback (only for review author)
 * @param {function} onDelete - Delete callback (for author or admin)
 * @param {function} onMarkHelpful - Mark as helpful callback
 * @param {string} currentUserId - Current logged-in user ID
 * @param {boolean} isAdmin - Whether current user is admin
 */
const ReviewCard = ({
  review,
  onEdit,
  onDelete,
  onMarkHelpful,
  currentUserId,
  isAdmin = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isAuthor = currentUserId === review.user?._id;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  // Check if review text is long (>300 chars)
  const isLongText = review.reviewText && review.reviewText.length > 300;
  const displayText =
    isLongText && !isExpanded
      ? review.reviewText.substring(0, 300) + '...'
      : review.reviewText;

  const formatDate = date => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return new Date(date).toLocaleDateString();
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      {/* User Info */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {review.user?.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <span className="text-lg font-semibold text-blue-600">
                {review.user?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {review.user?.name || 'Anonymous'}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
              {review.isEdited && (
                <span className="ml-2 text-xs text-gray-400">(edited)</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons (Edit/Delete) */}
        {(canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                title="Edit review"
              >
                <Edit2 size={18} />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(review._id)}
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                title="Delete review"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ratings */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-24 text-sm font-medium text-gray-700">
            Course:
          </span>
          <StarRating rating={review.courseRating} size="sm" showValue={true} />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 text-sm font-medium text-gray-700">
            Instructor:
          </span>
          <StarRating
            rating={review.instructorRating}
            size="sm"
            showValue={true}
          />
        </div>
      </div>

      {/* Review Text */}
      {review.reviewText && (
        <div className="mb-4">
          <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
            {displayText}
          </p>
          {isLongText && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Helpful/Not Helpful Buttons */}
      {!isAuthor && currentUserId && onMarkHelpful && (
        <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-600">Was this helpful?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMarkHelpful(review._id, true)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700"
            >
              <ThumbsUp size={16} />
              <span>{review.helpfulCount || 0}</span>
            </button>
            <button
              onClick={() => onMarkHelpful(review._id, false)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <ThumbsDown size={16} />
              <span>{review.notHelpfulCount || 0}</span>
            </button>
          </div>
        </div>
      )}

      {/* Show helpful counts if user is author or not logged in */}
      {(isAuthor || !currentUserId) && (
        <div className="flex items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <ThumbsUp size={16} />
            {review.helpfulCount || 0} helpful
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown size={16} />
            {review.notHelpfulCount || 0} not helpful
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;

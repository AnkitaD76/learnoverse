import { useState } from 'react';
import { X, Star, Trash2, Edit3 } from 'lucide-react';
import { Button } from './Button';
import StarRating from './StarRating';

/**
 * ReviewOptionsModal Component
 * Shows existing review with options to delete and write a new one
 */
const ReviewOptionsModal = ({
  isOpen,
  onClose,
  onDeleteAndReview,
  existingReview,
  courseName,
  instructorName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const formatDate = date => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Review</h2>
          {!isLoading && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Course Info */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">{courseName}</h3>
            {instructorName && (
              <p className="text-sm text-gray-500">by {instructorName}</p>
            )}
          </div>

          {/* Existing Review */}
          {existingReview && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium text-gray-600">
                    Course:
                  </span>
                  <StarRating
                    rating={existingReview.courseRating}
                    size="sm"
                    showValue={true}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium text-gray-600">
                    Instructor:
                  </span>
                  <StarRating
                    rating={existingReview.instructorRating}
                    size="sm"
                    showValue={true}
                  />
                </div>
              </div>

              {existingReview.reviewText && (
                <div className="mb-3">
                  <p className="text-sm leading-relaxed text-gray-700">
                    "{existingReview.reviewText}"
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Reviewed on {formatDate(existingReview.createdAt)}
              </p>
            </div>
          )}

          {/* Info Message */}
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> You can only have one review per course. To
              write a new review, your existing review will be deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={onDeleteAndReview}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center bg-red-600 text-white hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} className="mr-2" />
                  Delete Review
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border border-gray-300 bg-green-500 text-gray-700 hover:bg-green-600"
            >
              Keep Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOptionsModal;

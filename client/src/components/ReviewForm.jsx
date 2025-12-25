import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import { Button } from './Button';

/**
 * ReviewForm Component
 * Form for creating or editing a review with course and instructor ratings
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close modal callback
 * @param {function} onSubmit - Submit callback (courseRating, instructorRating, reviewText)
 * @param {object} initialData - Initial values for editing { courseRating, instructorRating, reviewText }
 * @param {boolean} isEditing - Whether this is an edit operation
 * @param {string} courseName - Name of the course being reviewed
 * @param {string} instructorName - Name of the instructor
 */
const ReviewForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  courseName = '',
  instructorName = '',
}) => {
  const [courseRating, setCourseRating] = useState(
    initialData?.courseRating || 0
  );
  const [instructorRating, setInstructorRating] = useState(
    initialData?.instructorRating || 0
  );
  const [reviewText, setReviewText] = useState(initialData?.reviewText || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when initial data changes (for editing)
  useEffect(() => {
    if (initialData) {
      setCourseRating(initialData.courseRating || 0);
      setInstructorRating(initialData.instructorRating || 0);
      setReviewText(initialData.reviewText || '');
    }
  }, [initialData]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      if (!isEditing) {
        setCourseRating(0);
        setInstructorRating(0);
        setReviewText('');
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, isEditing]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Validation
    if (courseRating === 0) {
      setError('Please rate the course');
      return;
    }

    if (instructorRating === 0) {
      setError('Please rate the instructor');
      return;
    }

    if (reviewText.length > 2000) {
      setError('Review text cannot exceed 2000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        courseRating,
        instructorRating,
        reviewText: reviewText.trim(),
      });

      // Reset form on success
      if (!isEditing) {
        setCourseRating(0);
        setInstructorRating(0);
        setReviewText('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Course Name */}
          {courseName && (
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="text-lg font-semibold text-gray-900">
                {courseName}
              </p>
            </div>
          )}

          {/* Course Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Course Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={courseRating}
                onRatingChange={setCourseRating}
                interactive={true}
                size="lg"
                showValue={true}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Click to select whole stars, or click between stars for half-stars
            </p>
          </div>

          {/* Instructor Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Instructor Rating {instructorName && `(${instructorName})`}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={instructorRating}
                onRatingChange={setInstructorRating}
                interactive={true}
                size="lg"
                showValue={true}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Click to select whole stars, or click between stars for half-stars
            </p>
          </div>

          {/* Review Text (Optional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your Review (Optional)
            </label>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your experience with this course and instructor..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              rows={6}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {reviewText.length}/2000 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting || courseRating === 0 || instructorRating === 0
              }
              className="flex-1"
            >
              {isSubmitting
                ? 'Submitting...'
                : isEditing
                  ? 'Update Review'
                  : 'Submit Review'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';
import { createReport } from '../api/reports';

const ReportModal = ({
  isOpen,
  onClose,
  reportType,
  reportedEntity,
  reportedUser = null,
}) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'inappropriate-content', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment/Bullying' },
    { value: 'scam', label: 'Scam/Fraud' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!category) {
      setError('Please select a category');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReport({
        reportType,
        reportedEntity,
        reportedUser,
        category,
        description: description.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategory('');
    setDescription('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              Report {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 transition-colors hover:bg-gray-100"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {success ? (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-800">
                ✓ Report submitted successfully
              </p>
              <p className="mt-1 text-sm text-green-600">
                Thank you for helping keep our platform safe.
              </p>
            </div>
          ) : (
            <>
              {/* Category Selection */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Why are you reporting this?
                </label>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label
                      key={cat.value}
                      className="flex cursor-pointer items-center rounded-lg border p-3 transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={category === cat.value}
                        onChange={e => setCategory(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Please describe the issue (min. 10 characters)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide details about why you're reporting this..."
                  rows={5}
                  maxLength={1000}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {description.length}/1000 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your report will be reviewed by our
                  team. False or spam reports may result in restrictions on your
                  account.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  disabled={
                    isSubmitting || !category || description.trim().length < 10
                  }
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reportType: PropTypes.oneOf([
    'course',
    'post',
    'user',
    'liveSession',
    'review',
  ]).isRequired,
  reportedEntity: PropTypes.string.isRequired,
  reportedUser: PropTypes.string,
};

export default ReportModal;

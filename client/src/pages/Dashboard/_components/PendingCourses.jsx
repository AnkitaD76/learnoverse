import { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Button } from '../../../components/Button';
import apiClient from '../../../api/client';

export const PendingCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectingCourse, setRejectingCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/admin/courses/pending');
      setCourses(response.data.courses || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCourse = async courseId => {
    setActionLoading(courseId);
    try {
      await apiClient.patch(`/admin/courses/${courseId}/approve`);
      setCourses(courses.filter(c => c._id !== courseId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCourse = async courseId => {
    setActionLoading(courseId);
    try {
      await apiClient.patch(`/admin/courses/${courseId}/reject`, {
        reason: rejectReason || 'Rejected by admin',
      });
      setCourses(courses.filter(c => c._id !== courseId));
      setRejectingCourse(null);
      setRejectReason('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject course');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Pending Course Approvals ({courses.length})
        </h2>
        <Button onClick={fetchPendingCourses} variant="secondary">
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {courses.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">
            No pending courses awaiting approval.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <Card key={course._id} className="border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {course.description}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium text-gray-800">
                        {course.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="font-medium text-gray-800">
                        {course.level}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Points</p>
                      <p className="font-medium text-gray-800">
                        {course.pricePoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Instructor</p>
                      <p className="font-medium text-gray-800">
                        {course.instructor?.name}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Submitted: {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-shrink-0 flex-col gap-2">
                  <Button
                    onClick={() => handleApproveCourse(course._id)}
                    isLoading={actionLoading === course._id}
                    className="bg-green-600 whitespace-nowrap text-white hover:bg-green-700"
                    size="sm"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => setRejectingCourse(course)}
                    variant="secondary"
                    className="border border-red-600 whitespace-nowrap text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Reject Course?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to reject{' '}
              <strong>{rejectingCourse.title}</strong>?
            </p>

            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (optional)..."
              className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingCourse(null);
                  setRejectReason('');
                }}
                disabled={actionLoading === rejectingCourse._id}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <Button
                onClick={() => handleRejectCourse(rejectingCourse._id)}
                isLoading={actionLoading === rejectingCourse._id}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PendingCourses;

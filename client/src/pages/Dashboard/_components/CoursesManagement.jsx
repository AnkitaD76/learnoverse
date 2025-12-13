import { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Button } from '../../../components/Button';
import apiClient from '../../../api/client';

export const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/courses');
      setCourses(response.data.courses);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
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
        <h2 className="text-xl font-semibold text-gray-800">Courses Management</h2>
        <Button onClick={fetchCourses} variant="secondary">
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No courses found</p>
        </Card>
      ) : (
        <div className="space-y-3 overflow-x-auto">
          {courses.map(course => (
            <Card key={course._id} className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center">
                {/* Course Title and Description */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-800">{course.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {course.description || 'No description'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      {course.level}
                    </span>
                    {!course.isPublished && (
                      <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructor and Meta Info */}
                <div className="text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Instructor:</span>{' '}
                    {course.instructor?.name || 'Unknown'}
                  </p>
                  <p className="mt-1 text-gray-600">
                    <span className="font-medium">Students:</span> {course.enrollCount || 0}
                  </p>
                  <p className="mt-1 text-gray-600">
                    <span className="font-medium">Points:</span> {course.pricePoints || 0}
                  </p>
                </div>

                {/* Created Date */}
                <div className="text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Created:</span>
                  </p>
                  <p className="text-gray-700">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(course)}
                    className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Delete Course?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <Button
                onClick={() => handleDeleteCourse(deleteConfirm._id)}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal (Placeholder) */}
      {editingCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800">Edit Course</h3>
            <p className="mt-2 text-sm text-gray-600">
              Edit functionality for <strong>{editingCourse.title}</strong> coming soon.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setEditingCourse(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;

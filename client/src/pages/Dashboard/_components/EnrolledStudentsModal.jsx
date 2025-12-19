import { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import apiClient from '../../../api/client';

export const EnrolledUsersModal = ({ course, onClose }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, [course._id]);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/courses/${course._id}/enrollments`);
      setStudents(response.data.enrollments);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(enrollment =>
    enrollment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {students.length} user{students.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">
                {searchTerm ? 'No students match your search' : 'No students enrolled'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map(enrollment => (
                <div key={enrollment._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {enrollment.user.avatar ? (
                      <img
                        src={enrollment.user.avatar}
                        alt={enrollment.user.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {enrollment.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{enrollment.user.name}</p>
                      <p className="text-sm text-gray-600 truncate">{enrollment.user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </Card>
    </div>
  );
};

export default EnrolledUsersModal;

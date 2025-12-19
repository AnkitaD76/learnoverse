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
            const response = await apiClient.get(
                `/courses/${course._id}/enrollments`
            );
            setStudents(response.data.enrollments);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load students');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(
        enrollment =>
            enrollment.user.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            enrollment.user.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                {course.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                {students.length} user
                                {students.length !== 1 ? 's' : ''} enrolled
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-xl font-bold text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                {searchTerm
                                    ? 'No students match your search'
                                    : 'No students enrolled'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredStudents.map(enrollment => (
                                <div
                                    key={enrollment._id}
                                    className="p-4 transition hover:bg-gray-50"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        {enrollment.user.avatar ? (
                                            <img
                                                src={enrollment.user.avatar}
                                                alt={enrollment.user.name}
                                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-semibold text-white">
                                                {enrollment.user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        {/* Student Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-800">
                                                {enrollment.user.name}
                                            </p>
                                            <p className="truncate text-sm text-gray-600">
                                                {enrollment.user.email}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Enrolled on{' '}
                                                {new Date(
                                                    enrollment.enrolledAt
                                                ).toLocaleDateString()}
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
                <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-4">
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

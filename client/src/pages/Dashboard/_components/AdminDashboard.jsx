import { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Button } from '../../../components/Button';
import apiClient from '../../../api/client';
import { CoursesManagement } from './CoursesManagement';
import { UsersManagement } from './UsersManagement';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/admin/stats');
        setStats(response.data.stats);
      } catch (err) {
        console.log(err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (userId) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      // Refresh stats after deletion
      const response = await apiClient.get('/admin/stats');
      setStats(response.data.stats);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
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

  if (error) {
    return (
      <Card>
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'courses'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Courses
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.statistics?.totalUsers || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Total Users</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {stats?.statistics?.studentCount || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Students</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.statistics?.instructorCount || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Instructors</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {stats?.statistics?.adminCount || 0}
                </p>
                <p className="mt-1 text-sm text-gray-600">Admins</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Verification Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified Users:</span>
                  <span className="font-semibold">
                    {stats?.statistics?.verifiedUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unverified Users:</span>
                  <span className="font-semibold">
                    {stats?.statistics?.unverifiedUsers || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Recent Users
              </h3>
              <div className="space-y-3">
                {stats?.recentUsers?.slice(0, 5).map(user => (
                  <div key={user._id} className="flex items-center justify-between rounded-lg border border-gray-200 p-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold capitalize text-gray-600">{user.role}</span>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Delete User?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <p className="mt-1 text-xs text-gray-500">{deleteConfirm.email}</p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <Button
                variant="danger"
                onClick={() => handleDeleteUser(deleteConfirm._id)}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && <CoursesManagement />}
    </div>
  );
};
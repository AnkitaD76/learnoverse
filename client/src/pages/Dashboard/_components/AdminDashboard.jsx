import { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import apiClient from '../../../api/client';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/users/admin/dashboard');
        setStats(response.data.dashboard);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <div className="space-y-2">
            {stats?.recentUsers?.slice(0, 5).map(user => (
              <div key={user._id} className="flex justify-between text-sm">
                <span className="text-gray-800">{user.name}</span>
                <span className="text-gray-600 capitalize">{user.role}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Button } from '../../../components/Button';
import apiClient from '../../../api/client';

export const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data.users);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-700',
      instructor: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
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
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Users Management</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={fetchUsers} variant="secondary">
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600">
            {searchTerm ? 'No users match your search' : 'No users found'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2 overflow-x-auto">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-3 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Joined</div>
            <div>Actions</div>
          </div>

          {/* Users List */}
          {filteredUsers.map(user => (
            <Card key={user._id} className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:items-center">
                {/* Name */}
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-500 md:hidden font-semibold">Name</p>
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="font-medium text-gray-800">{user.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-500 md:hidden font-semibold">Email</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>

                {/* Role */}
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-500 md:hidden font-semibold">Role</p>
                  <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>

                {/* Verification Status */}
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-500 md:hidden font-semibold">Status</p>
                  <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                    user.isVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                {/* Joined Date */}
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-500 md:hidden font-semibold">Joined</p>
                  <p className="text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="md:col-span-1">
                  <p className="text-xs text-gray-500 md:hidden font-semibold mb-2">Actions</p>
                  <button
                    onClick={() => setDeleteConfirm(user)}
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
            <h3 className="text-lg font-semibold text-gray-800">Delete User?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})? This action cannot be undone.
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
    </div>
  );
};

export default UsersManagement;

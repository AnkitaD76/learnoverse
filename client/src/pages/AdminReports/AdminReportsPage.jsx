import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Trash2,
  Ban,
  X as XIcon,
} from 'lucide-react';
import {
  getAllReports,
  getReportById,
  dismissReport,
  takeActionOnReport,
  getReportStats,
} from '../../api/reports';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    reportType: '',
    category: '',
    page: 1,
    limit: 20,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllReports(filters);
      setReports(data.reports);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async reportId => {
    try {
      const data = await getReportById(reportId);
      setSelectedReport(data.report);
      setShowDetailModal(true);
    } catch (err) {
      alert('Failed to fetch report details');
    }
  };

  const handleDismiss = async (reportId, adminNotes) => {
    if (!confirm('Are you sure you want to dismiss this report?')) return;

    setActionLoading(true);
    try {
      await dismissReport(reportId, adminNotes);
      alert('Report dismissed successfully');
      setShowDetailModal(false);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dismiss report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTakeAction = async (reportId, action, adminNotes) => {
    const confirmMessages = {
      'delete-content': 'Are you sure you want to delete this content?',
      'ban-user': 'Are you sure you want to ban this user?',
      'delete-and-ban':
        'Are you sure you want to delete content AND ban the user?',
    };

    if (!confirm(confirmMessages[action])) return;

    setActionLoading(true);
    try {
      await takeActionOnReport(reportId, action, adminNotes);
      alert('Action taken successfully');
      setShowDetailModal(false);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to take action');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = status => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending',
      },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Reviewed' },
      dismissed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Dismissed',
      },
      'action-taken': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Action Taken',
      },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Reports Dashboard
          </h1>
          <p className="text-gray-600">
            Review and manage user-submitted reports
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.pending || 0}
                  </p>
                </div>
                <Clock className="text-yellow-600" size={32} />
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Reviewed</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.reviewed || 0}
                  </p>
                </div>
                <CheckCircle className="text-blue-600" size={32} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dismissed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.dismissed || 0}
                  </p>
                </div>
                <XCircle className="text-gray-600" size={32} />
              </div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Action Taken
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats['action-taken'] || 0}
                  </p>
                </div>
                <AlertTriangle className="text-green-600" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              value={filters.status}
              onChange={e =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
              <option value="action-taken">Action Taken</option>
            </select>

            <select
              value={filters.reportType}
              onChange={e =>
                setFilters({ ...filters, reportType: e.target.value, page: 1 })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="course">Course</option>
              <option value="post">Post</option>
              <option value="user">User</option>
              <option value="liveSession">Live Session</option>
              <option value="review">Review</option>
            </select>

            <select
              value={filters.category}
              onChange={e =>
                setFilters({ ...filters, category: e.target.value, page: 1 })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="inappropriate-content">
                Inappropriate Content
              </option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="scam">Scam/Fraud</option>
              <option value="copyright">Copyright</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <AlertTriangle className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              No reports found
            </h3>
            <p className="text-gray-500">
              No reports match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Report ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reports.map(report => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      #{report._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                      {report.reportType}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                      {report.category}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                      {report.reporter?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(report._id)}
                        className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setShowDetailModal(false)}
          onDismiss={handleDismiss}
          onTakeAction={handleTakeAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

// Report Detail Modal Component
const ReportDetailModal = ({
  report,
  onClose,
  onDismiss,
  onTakeAction,
  actionLoading,
}) => {
  const [adminNotes, setAdminNotes] = useState('');

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Report Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Report ID</p>
              <p className="font-medium">#{report._id.slice(-8)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium capitalize">{report.reportType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium">{report.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{report.status}</p>
            </div>
          </div>

          {/* Reporter */}
          <div>
            <p className="mb-2 text-sm text-gray-600">Reported By</p>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                {report.reporter?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium">{report.reporter?.name}</p>
                <p className="text-sm text-gray-600">
                  {report.reporter?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="mb-2 text-sm text-gray-600">Description</p>
            <p className="rounded-lg bg-gray-50 p-4">{report.description}</p>
          </div>

          {/* Reported Entity Preview */}
          {report.reportedEntity && (
            <div>
              <p className="mb-2 text-sm text-gray-600">Reported Content</p>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                {report.reportType === 'course' && (
                  <div>
                    <p className="font-semibold">
                      {report.reportedEntity.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {report.reportedEntity.description}
                    </p>
                  </div>
                )}
                {report.reportType === 'post' && (
                  <p className="text-sm">{report.reportedEntity.text}</p>
                )}
                {report.reportType === 'user' && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500 font-bold text-white">
                      {report.reportedEntity.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {report.reportedEntity.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {report.reportedEntity.email}
                      </p>
                    </div>
                  </div>
                )}
                {report.reportType === 'review' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Course:</span>
                      <span className="text-sm text-gray-600">
                        {report.reportedEntity.course?.title ||
                          'Unknown Course'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">By:</span>
                      <span className="text-sm text-gray-600">
                        {report.reportedEntity.user?.name || 'Unknown User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        Course Rating: {report.reportedEntity.courseRating}/5
                      </span>
                      <span>
                        Instructor Rating:{' '}
                        {report.reportedEntity.instructorRating}/5
                      </span>
                    </div>
                    {report.reportedEntity.reviewText && (
                      <p className="mt-2 rounded border bg-white p-2 text-sm">
                        "{report.reportedEntity.reviewText}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes Input (only if pending) */}
          {report.status === 'pending' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Existing Admin Notes */}
          {report.adminNotes && (
            <div>
              <p className="mb-2 text-sm text-gray-600">Previous Admin Notes</p>
              <p className="rounded-lg bg-blue-50 p-4">{report.adminNotes}</p>
            </div>
          )}

          {/* Action Buttons (only if pending) */}
          {report.status === 'pending' && (
            <div className="flex gap-3 border-t pt-4">
              <button
                onClick={() => onDismiss(report._id, adminNotes)}
                disabled={actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-3 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                <XCircle size={18} />
                Dismiss Report
              </button>
              <button
                onClick={() =>
                  onTakeAction(report._id, 'delete-content', adminNotes)
                }
                disabled={actionLoading || report.reportType === 'user'}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-white hover:bg-orange-700 disabled:opacity-50"
              >
                <Trash2 size={18} />
                Delete Content
              </button>
              <button
                onClick={() => onTakeAction(report._id, 'ban-user', adminNotes)}
                disabled={actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Ban size={18} />
                Ban User
              </button>
              {report.reportType !== 'user' && (
                <button
                  onClick={() =>
                    onTakeAction(report._id, 'delete-and-ban', adminNotes)
                  }
                  disabled={actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-3 text-white hover:bg-red-900 disabled:opacity-50"
                >
                  <AlertTriangle size={18} />
                  Delete & Ban
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;

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

    const handleViewDetails = async (reportId) => {
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

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Reviewed' },
            dismissed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dismissed' },
            'action-taken': {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'Action Taken',
            },
        };
        const badge = badges[status] || badges.pending;
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
            >
                {badge.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Reports Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Review and manage user-submitted reports
                    </p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-600 text-sm font-medium">
                                        Pending
                                    </p>
                                    <p className="text-2xl font-bold text-yellow-900">
                                        {stats.pending || 0}
                                    </p>
                                </div>
                                <Clock className="text-yellow-600" size={32} />
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium">Reviewed</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {stats.reviewed || 0}
                                    </p>
                                </div>
                                <CheckCircle className="text-blue-600" size={32} />
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Dismissed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.dismissed || 0}
                                    </p>
                                </div>
                                <XCircle className="text-gray-600" size={32} />
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-medium">
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
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={20} className="text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                setFilters({ ...filters, status: e.target.value, page: 1 })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="dismissed">Dismissed</option>
                            <option value="action-taken">Action Taken</option>
                        </select>

                        <select
                            value={filters.reportType}
                            onChange={(e) =>
                                setFilters({ ...filters, reportType: e.target.value, page: 1 })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="course">Course</option>
                            <option value="post">Post</option>
                            <option value="user">User</option>
                            <option value="liveSession">Live Session</option>
                        </select>

                        <select
                            value={filters.category}
                            onChange={(e) =>
                                setFilters({ ...filters, category: e.target.value, page: 1 })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="inappropriate-content">Inappropriate Content</option>
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
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading reports...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <AlertTriangle className="text-gray-300 mx-auto mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No reports found
                        </h3>
                        <p className="text-gray-500">
                            No reports match your current filters.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            #{report._id.slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {report.reportType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {report.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {report.reporter?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewDetails(report._id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
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
                            onClick={() =>
                                setFilters({ ...filters, page: filters.page - 1 })
                            }
                            disabled={filters.page === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() =>
                                setFilters({ ...filters, page: filters.page + 1 })
                            }
                            disabled={filters.page === pagination.pages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Report Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                        <XIcon size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
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
                        <p className="text-sm text-gray-600 mb-2">Reported By</p>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
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
                        <p className="text-sm text-gray-600 mb-2">Description</p>
                        <p className="p-4 bg-gray-50 rounded-lg">{report.description}</p>
                    </div>

                    {/* Reported Entity Preview */}
                    {report.reportedEntity && (
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Reported Content</p>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
                                        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
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
                            </div>
                        </div>
                    )}

                    {/* Admin Notes Input (only if pending) */}
                    {report.status === 'pending' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes about your decision..."
                                rows={3}
                                maxLength={500}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Existing Admin Notes */}
                    {report.adminNotes && (
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Previous Admin Notes</p>
                            <p className="p-4 bg-blue-50 rounded-lg">{report.adminNotes}</p>
                        </div>
                    )}

                    {/* Action Buttons (only if pending) */}
                    {report.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={() => onDismiss(report._id, adminNotes)}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                            >
                                <XCircle size={18} />
                                Dismiss Report
                            </button>
                            <button
                                onClick={() =>
                                    onTakeAction(report._id, 'delete-content', adminNotes)
                                }
                                disabled={actionLoading || report.reportType === 'user'}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                <Trash2 size={18} />
                                Delete Content
                            </button>
                            <button
                                onClick={() =>
                                    onTakeAction(report._id, 'ban-user', adminNotes)
                                }
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                <Ban size={18} />
                                Ban User
                            </button>
                            {report.reportType !== 'user' && (
                                <button
                                    onClick={() =>
                                        onTakeAction(
                                            report._id,
                                            'delete-and-ban',
                                            adminNotes
                                        )
                                    }
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50"
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

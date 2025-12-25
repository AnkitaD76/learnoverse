import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { getMyReports } from '../../api/reports';

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchReports();
  }, [pagination.page]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyReports(pagination.page, pagination.limit);
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = status => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pending Review',
      },
      reviewed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: FileText,
        label: 'Reviewed',
      },
      dismissed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Dismissed',
      },
      'action-taken': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Action Taken',
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const getCategoryLabel = category => {
    const labels = {
      'inappropriate-content': 'Inappropriate Content',
      spam: 'Spam',
      harassment: 'Harassment/Bullying',
      scam: 'Scam/Fraud',
      copyright: 'Copyright Violation',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getReportTypeLabel = type => {
    const labels = {
      course: 'Course',
      post: 'Post',
      user: 'User',
      liveSession: 'Live Session',
    };
    return labels[type] || type;
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          </div>
          <p className="text-gray-600">
            Track the status of all your submitted reports
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <AlertTriangle className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              No reports submitted
            </h3>
            <p className="text-gray-500">
              You haven't submitted any reports yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div
                key={report._id}
                className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                        {getReportTypeLabel(report.reportType)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {getCategoryLabel(report.category)}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Report #{report._id.slice(-8)}
                    </h3>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <p className="mb-4 rounded-lg bg-gray-50 p-3 text-gray-700">
                  {report.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Submitted on{' '}
                    {new Date(report.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {report.reviewedAt && (
                    <span>
                      Reviewed on{' '}
                      {new Date(report.reviewedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                {report.adminNotes && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      Admin Notes:
                    </p>
                    <p className="text-sm text-gray-600">{report.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() =>
                setPagination(prev => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination(prev => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;

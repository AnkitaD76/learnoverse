import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTransactionHistory, getPayoutRequests } from '../../api/wallet';
import TransactionItem from '../../components/wallet/TransactionItem';
import StatusBadge from '../../components/wallet/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * TRANSACTION HISTORY PAGE
 *
 * View all wallet transactions with filtering and pagination.
 *
 * FEATURES:
 * - Paginated transaction list
 * - Filter by type (all, purchase, sale, enrollment, refund)
 * - Filter by status (all, pending, completed, failed)
 * - View transaction details
 * - View payout requests
 * - Export transactions (future)
 *
 * CRITICAL:
 * - Always fetch from backend
 * - Show loading states
 * - Handle pagination
 * - Display errors
 */
const TransactionHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState('transactions'); // 'transactions' or 'payouts'
  const [transactions, setTransactions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    status: searchParams.get('status') || 'all',
  });

  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Fetch transactions
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
      };

      const data = await getTransactionHistory(params);

      setTransactions(data.transactions);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch payout requests
  const fetchPayoutRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        ...(filters.status !== 'all' && { status: filters.status }),
      };

      const data = await getPayoutRequests(params);

      setPayoutRequests(data.payout_requests);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (err) {
      console.error('Failed to fetch payout requests:', err);
      setError(err.response?.data?.message || 'Failed to load payout requests');
      setPayoutRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when filters/page change
  useEffect(() => {
    if (view === 'transactions') {
      fetchTransactions();
    } else {
      fetchPayoutRequests();
    }
  }, [view, page, filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (page !== 1) params.set('page', page.toString());
    setSearchParams(params);
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  };

  const handleViewChange = newView => {
    setView(newView);
    setPage(1);
    setFilters({ type: 'all', status: 'all' });
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="transaction-history-page">
      <header className="page-header">
        <h1>Transaction History</h1>
        <p>View all your wallet transactions and payout requests</p>
      </header>

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`tab ${view === 'transactions' ? 'active' : ''}`}
          onClick={() => handleViewChange('transactions')}
        >
          Transactions
        </button>
        <button
          className={`tab ${view === 'payouts' ? 'active' : ''}`}
          onClick={() => handleViewChange('payouts')}
        >
          Payout Requests
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        {view === 'transactions' && (
          <div className="filter-group">
            <label>Type:</label>
            <select
              value={filters.type}
              onChange={e => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="PURCHASE">Purchase</option>
              <option value="SALE">Sale</option>
              <option value="ENROLLMENT">Enrollment</option>
              <option value="REFUND">Refund</option>
              <option value="PAYOUT_REVERSAL">Payout Reversal</option>
              <option value="ADMIN_ADJUSTMENT">Admin Adjustment</option>
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            {view === 'payouts' && (
              <>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </>
            )}
          </select>
        </div>

        <div className="filter-info">
          <span className="count">
            {totalCount}{' '}
            {view === 'transactions' ? 'transactions' : 'payout requests'}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">
            ×
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading && page === 1 ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading {view}...</p>
        </div>
      ) : view === 'transactions' ? (
        <>
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map(transaction => (
                <TransactionItem
                  key={transaction.transaction_id}
                  transaction={transaction}
                  showDetails={true}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No transactions found</p>
              <p className="empty-subtitle">
                {filters.type !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by buying points or enrolling in courses'}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {payoutRequests.length > 0 ? (
            <div className="payout-requests-list">
              {payoutRequests.map(payout => (
                <div key={payout._id} className="payout-request-item">
                  <div className="payout-main">
                    <div className="payout-info">
                      <div className="payout-amount">
                        <span className="points">
                          {payout.points_amount.toLocaleString()} pts
                        </span>
                        <span className="arrow">→</span>
                        <span className="cash">
                          {payout.currency} {payout.cash_amount}
                        </span>
                      </div>
                      <div className="payout-meta">
                        <span className="payout-method">
                          {payout.payout_method.replace(/_/g, ' ')}
                        </span>
                        <span className="payout-date">
                          {formatDate(payout.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="payout-right">
                      <StatusBadge status={payout.status} />
                    </div>
                  </div>

                  <div className="payout-details">
                    <div className="detail-row">
                      <span>Request ID:</span>
                      <span className="monospace">{payout._id}</span>
                    </div>
                    <div className="detail-row">
                      <span>Transaction ID:</span>
                      <span className="monospace">
                        {payout.transaction_id?.slice(0, 16)}...
                      </span>
                    </div>
                    {payout.processed_at && (
                      <div className="detail-row">
                        <span>Processed:</span>
                        <span>{formatDate(payout.processed_at)}</span>
                      </div>
                    )}
                    {payout.admin_notes && (
                      <div className="detail-row">
                        <span>Admin Notes:</span>
                        <span className="admin-notes">
                          {payout.admin_notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No payout requests found</p>
              <p className="empty-subtitle">
                {filters.status !== 'all'
                  ? 'Try adjusting your filters'
                  : "You haven't requested any payouts yet"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="pagination-btn"
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page {page} of {totalPages}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {isLoading && page > 1 && (
        <div className="loading-overlay">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

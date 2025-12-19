import StatusBadge from './StatusBadge';

/**
 * TRANSACTION ITEM
 *
 * Single transaction display in a list.
 *
 * DESIGN:
 * - Show type icon
 * - Display description
 * - Show amount with +/- indicator
 * - Include timestamp
 * - Status badge
 * - Expandable details (optional)
 */
const TransactionItem = ({ transaction, showDetails = false }) => {
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

  const getTypeIcon = type => {
    switch (type) {
      case 'PURCHASE':
        return '💰';
      case 'SALE':
        return '💸';
      case 'ENROLLMENT':
        return '📚';
      case 'REFUND':
        return '↩️';
      case 'PAYOUT_REVERSAL':
        return '⚠️';
      case 'ADMIN_ADJUSTMENT':
        return '⚙️';
      default:
        return '🔄';
    }
  };

  const getAmountDisplay = transaction => {
    const amount = transaction.points_amount || transaction.amount || 0;
    const isCredit = amount > 0;
    const prefix = isCredit ? '+' : '';
    return `${prefix}${amount.toLocaleString()}`;
  };

  const getAmountClass = transaction => {
    const amount = transaction.points_amount || transaction.amount || 0;
    return amount > 0 ? 'credit' : 'debit';
  };

  return (
    <div className="transaction-item">
      <div className="transaction-main">
        <div className="transaction-icon">{getTypeIcon(transaction.type)}</div>

        <div className="transaction-info">
          <div className="transaction-description">
            {transaction.description ||
              transaction.type?.replace(/_/g, ' ') ||
              'Transaction'}
          </div>
          <div className="transaction-meta">
            {transaction.transaction_id && (
              <span
                className="transaction-id"
                title={transaction.transaction_id}
              >
                {transaction.transaction_id.slice(0, 8)}...
              </span>
            )}
            {transaction.created_at && (
              <span className="transaction-date">
                {formatDate(transaction.created_at)}
              </span>
            )}
            {transaction.createdAt && !transaction.created_at && (
              <span className="transaction-date">
                {formatDate(transaction.createdAt)}
              </span>
            )}
          </div>
        </div>

        <div className="transaction-right">
          <div className={`transaction-amount ${getAmountClass(transaction)}`}>
            {getAmountDisplay(transaction)} pts
          </div>
          <StatusBadge status={transaction.status} />
        </div>
      </div>

      {showDetails && transaction.metadata && (
        <div className="transaction-details">
          {transaction.metadata.currency && (
            <div className="detail-row">
              <span>Currency:</span>
              <span>{transaction.metadata.currency}</span>
            </div>
          )}
          {transaction.metadata.cash_amount != null && (
            <div className="detail-row">
              <span>Cash Amount:</span>
              <span>
                {transaction.metadata.currency}{' '}
                {transaction.metadata.cash_amount}
              </span>
            </div>
          )}
          {transaction.metadata.exchange_rate && (
            <div className="detail-row">
              <span>Exchange Rate:</span>
              <span>{transaction.metadata.exchange_rate} pts per unit</span>
            </div>
          )}
          {transaction.metadata.payment_method && (
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>{transaction.metadata.payment_method}</span>
            </div>
          )}
          {transaction.metadata.course_title && (
            <div className="detail-row">
              <span>Course:</span>
              <span>{transaction.metadata.course_title}</span>
            </div>
          )}
          {transaction.balance_after != null && (
            <div className="detail-row">
              <span>Balance After:</span>
              <span>{transaction.balance_after.toLocaleString()} pts</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionItem;

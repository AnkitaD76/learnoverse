/**
 * STATUS BADGE
 *
 * Visual indicator for transaction/payout status.
 *
 * STATUSES:
 * - pending: Yellow/orange - awaiting action
 * - completed/success: Green - successfully processed
 * - failed/rejected: Red - error occurred
 * - processing: Blue - in progress
 * - approved: Light green - approved but not completed
 */
const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = status => {
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
      case 'completed':
      case 'success':
        return { label: 'Completed', color: 'green' };

      case 'pending':
        return { label: 'Pending', color: 'yellow' };

      case 'processing':
        return { label: 'Processing', color: 'blue' };

      case 'failed':
      case 'rejected':
        return { label: 'Failed', color: 'red' };

      case 'approved':
        return { label: 'Approved', color: 'light-green' };

      case 'cancelled':
        return { label: 'Cancelled', color: 'gray' };

      default:
        return { label: status || 'Unknown', color: 'gray' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge status-${config.color} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

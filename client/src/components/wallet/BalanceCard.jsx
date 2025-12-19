import { useWallet } from '../../contexts/WalletContext';
import { LoadingSpinner } from '../LoadingSpinner';

/**
 * BALANCE CARD
 *
 * Displays user's wallet balance with points and cash equivalent.
 *
 * DESIGN PRINCIPLES:
 * - Show both points and cash value
 * - Distinguish available vs reserved points
 * - Loading state while fetching
 * - Refresh button for manual sync
 */
const BalanceCard = ({ showDetails = false, className = '' }) => {
  const { wallet, isLoading, refreshWallet, getRate } = useWallet();

  if (isLoading && !wallet) {
    return (
      <div className={`balance-card loading ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className={`balance-card empty ${className}`}>
        <p>No wallet data available</p>
      </div>
    );
  }

  const defaultRate = getRate(wallet.default_currency || 'USD');
  const cashValue = wallet.cash_equivalent_balance || 0;

  return (
    <div className={`balance-card ${className}`}>
      <div className="balance-header">
        <h3>Wallet Balance</h3>
        <button
          onClick={refreshWallet}
          disabled={isLoading}
          className="refresh-btn"
          title="Refresh balance"
        >
          {isLoading ? '⟳' : '↻'}
        </button>
      </div>

      <div className="balance-main">
        <div className="points-balance">
          <span className="label">Available Points</span>
          <span className="amount">
            {wallet.available_balance.toLocaleString()}
          </span>
        </div>

        <div className="cash-equivalent">
          <span className="label">≈</span>
          <span className="amount">
            {wallet.default_currency} {cashValue.toFixed(2)}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="balance-details">
          <div className="detail-row">
            <span>Total Points:</span>
            <span>{wallet.points_balance.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span>Reserved:</span>
            <span className="reserved">
              {wallet.reserved_points.toLocaleString()}
            </span>
          </div>
          <div className="detail-row">
            <span>Available:</span>
            <span className="available">
              {wallet.available_balance.toLocaleString()}
            </span>
          </div>
          {defaultRate && (
            <div className="detail-row rate">
              <span>Exchange Rate:</span>
              <span>{defaultRate.description}</span>
            </div>
          )}
        </div>
      )}

      {showDetails && (
        <div className="balance-stats">
          <div className="stat">
            <span className="stat-label">Total Earned</span>
            <span className="stat-value earned">
              +{wallet.total_points_earned.toLocaleString()}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value spent">
              -{wallet.total_points_spent.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;

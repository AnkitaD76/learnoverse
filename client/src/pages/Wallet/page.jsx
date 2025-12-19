import { Link } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import BalanceCard from '../../components/wallet/BalanceCard';
import TransactionItem from '../../components/wallet/TransactionItem';
import { LoadingSpinner } from '../../components/LoadingSpinner';

/**
 * WALLET DASHBOARD
 *
 * Main wallet overview page.
 *
 * FEATURES:
 * - Display balance
 * - Recent transactions
 * - Quick actions (buy/sell)
 * - Error handling
 * - Loading states
 *
 * NAVIGATION:
 * - /wallet/buy - Buy points
 * - /wallet/sell - Sell points
 * - /wallet/transactions - Full history
 */
const WalletDashboard = () => {
  const { wallet, recentTransactions, isLoading, error, clearError } =
    useWallet();

  if (isLoading && !wallet) {
    return (
      <div className="wallet-dashboard loading">
        <LoadingSpinner />
        <p>Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="wallet-dashboard">
      <header className="page-header">
        <h1>My Wallet</h1>
        <p>Manage your points and transactions</p>
      </header>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={clearError} className="alert-close">
            ×
          </button>
        </div>
      )}

      {/* Balance Card */}
      <section className="wallet-balance-section">
        <BalanceCard showDetails={true} />
      </section>

      {/* Quick Actions */}
      <section className="wallet-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/wallet/buy" className="action-card buy">
            <div className="action-icon">💰</div>
            <h3>Buy Points</h3>
            <p>Purchase points with your preferred currency</p>
          </Link>

          <Link to="/wallet/sell" className="action-card sell">
            <div className="action-icon">💸</div>
            <h3>Sell Points</h3>
            <p>Convert points to cash (request payout)</p>
          </Link>

          <Link to="/wallet/transactions" className="action-card history">
            <div className="action-icon">📊</div>
            <h3>Transaction History</h3>
            <p>View all your wallet transactions</p>
          </Link>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="wallet-recent-transactions">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <Link to="/wallet/transactions" className="view-all-link">
            View All →
          </Link>
        </div>

        {isLoading && !recentTransactions.length ? (
          <LoadingSpinner />
        ) : recentTransactions.length > 0 ? (
          <div className="transactions-list">
            {recentTransactions.map(transaction => (
              <TransactionItem
                key={transaction.transaction_id}
                transaction={transaction}
                showDetails={false}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No transactions yet</p>
            <p className="empty-subtitle">
              Buy points or enroll in courses to see transactions here
            </p>
          </div>
        )}
      </section>

      {/* Wallet Info */}
      <section className="wallet-info">
        <h2>How Points Work</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>💰 Buy Points</h3>
            <p>
              Purchase points using USD, BDT, EUR, or GBP. Points are credited
              immediately after payment.
            </p>
          </div>
          <div className="info-card">
            <h3>📚 Use Points</h3>
            <p>
              Enroll in courses using points instead of traditional payment
              methods. Points are deducted when enrollment is confirmed.
            </p>
          </div>
          <div className="info-card">
            <h3>💸 Sell Points</h3>
            <p>
              Request a payout to convert points back to cash. Points are held
              until payout is processed.
            </p>
          </div>
          <div className="info-card">
            <h3>🔄 Exchange Rates</h3>
            <p>
              Rates are set by administrators and may vary by currency. Check
              current rates before transactions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WalletDashboard;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import ExchangeRateSelector from '../../components/wallet/ExchangeRateSelector';
import ConfirmationModal from '../../components/wallet/ConfirmationModal';
import BalanceCard from '../../components/wallet/BalanceCard';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * SELL POINTS PAGE
 *
 * Request payout by selling points.
 *
 * FLOW:
 * 1. Check available balance
 * 2. Select currency
 * 3. Enter points to sell
 * 4. Enter payout details
 * 5. Review with WARNING (irreversible)
 * 6. Submit → Points debited immediately
 * 7. Show success/failure
 * 8. Redirect to wallet or payout requests
 *
 * CRITICAL:
 * - Show warning: irreversible
 * - Points debited immediately (escrow)
 * - Require explicit confirmation
 * - Disable if insufficient balance
 */
const SellPoints = () => {
  const navigate = useNavigate();
  const {
    wallet,
    sellPoints,
    hasSufficientBalance,
    pendingOperation,
    error,
    clearError,
  } = useWallet();

  const [formData, setFormData] = useState({
    currency: 'USD',
    cash_amount: null,
    points_amount: null,
    rate: null,
    payout_method: '',
    payout_details: {},
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [step, setStep] = useState(1); // 1: form, 2: result

  const payoutMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: '2-3 business days',
    },
    { id: 'paypal', name: 'PayPal', description: '1-2 business days' },
    {
      id: 'mobile_money',
      name: 'Mobile Money (bKash/Nagad)',
      description: '24 hours',
    },
  ];

  const handleAmountChange = amountData => {
    if (amountData) {
      setFormData(prev => ({
        ...prev,
        currency: amountData.currency,
        cash_amount: amountData.cash_amount,
        points_amount: amountData.points_amount,
        rate: amountData.rate,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        cash_amount: null,
        points_amount: null,
      }));
    }
  };

  const handlePayoutMethodChange = methodId => {
    setFormData(prev => ({
      ...prev,
      payout_method: methodId,
      payout_details: {}, // Reset details when method changes
    }));
  };

  const handlePayoutDetailsChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      payout_details: {
        ...prev.payout_details,
        [key]: value,
      },
    }));
  };

  const isFormValid = () => {
    const hasAmount = formData.cash_amount > 0 && formData.points_amount > 0;
    const hasMethod = formData.payout_method;
    const hasSufficientPoints = hasSufficientBalance(formData.points_amount);

    // Check payout-specific required fields
    let hasRequiredDetails = true;
    if (formData.payout_method === 'bank_transfer') {
      hasRequiredDetails =
        formData.payout_details.bank_name &&
        formData.payout_details.account_number &&
        formData.payout_details.account_holder;
    } else if (formData.payout_method === 'paypal') {
      hasRequiredDetails = formData.payout_details.paypal_email;
    } else if (formData.payout_method === 'mobile_money') {
      hasRequiredDetails =
        formData.payout_details.mobile_number &&
        formData.payout_details.provider;
    }

    return hasAmount && hasMethod && hasSufficientPoints && hasRequiredDetails;
  };

  const handleReviewClick = () => {
    if (!isFormValid()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmPayout = async () => {
    clearError();

    const payoutData = {
      points_amount: formData.points_amount,
      currency: formData.currency,
      payout_method: formData.payout_method,
      payout_details: formData.payout_details,
    };

    const result = await sellPoints(payoutData);

    setTransactionResult(result);
    setShowConfirmModal(false);
    setStep(2);
  };

  const handleBackToWallet = () => {
    navigate('/wallet');
  };

  const handleViewPayouts = () => {
    navigate('/wallet/transactions?filter=payout');
  };

  const handleSellMore = () => {
    setStep(1);
    setFormData({
      currency: formData.currency,
      cash_amount: null,
      points_amount: null,
      rate: null,
      payout_method: '',
      payout_details: {},
    });
    setTransactionResult(null);
    clearError();
  };

  // Result Screen
  if (step === 2 && transactionResult) {
    return (
      <div className="sell-points-page result-page">
        <div className="result-container">
          {transactionResult.success ? (
            <>
              <div className="result-icon success">✓</div>
              <h1>Payout Request Submitted</h1>
              <p className="result-message">
                Your payout request has been submitted. Points have been
                deducted from your balance and will be held until the payout is
                processed.
              </p>

              <div className="result-details">
                <div className="detail-row">
                  <span>Points Sold:</span>
                  <span className="highlight">
                    {transactionResult.data.payout_request.points_amount.toLocaleString()}{' '}
                    pts
                  </span>
                </div>
                <div className="detail-row">
                  <span>Cash Amount:</span>
                  <span className="highlight">
                    {transactionResult.data.payout_request.currency}{' '}
                    {transactionResult.data.payout_request.cash_amount}
                  </span>
                </div>
                <div className="detail-row">
                  <span>New Balance:</span>
                  <span>
                    {transactionResult.data.wallet.available_balance.toLocaleString()}{' '}
                    pts
                  </span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className="status-pending">
                    {transactionResult.data.payout_request.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Request ID:</span>
                  <span className="transaction-id">
                    {transactionResult.data.payout_request._id}
                  </span>
                </div>
              </div>

              <div className="warning-box">
                <strong>⏳ Processing Time:</strong>
                <p>
                  Your payout will be processed within{' '}
                  {
                    payoutMethods.find(m => m.id === formData.payout_method)
                      ?.description
                  }
                  . You'll be notified when the payout is completed.
                </p>
              </div>

              <div className="result-actions">
                <button
                  onClick={handleBackToWallet}
                  className="btn btn-primary"
                >
                  Back to Wallet
                </button>
                <button
                  onClick={handleViewPayouts}
                  className="btn btn-secondary"
                >
                  View Payout Requests
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="result-icon error">✗</div>
              <h1>Payout Request Failed</h1>
              <p className="result-message error">
                {transactionResult.error ||
                  'An error occurred during the payout request.'}
              </p>

              <div className="info-box">
                <p>
                  Your points have <strong>not</strong> been deducted. You can
                  try again or contact support if the issue persists.
                </p>
              </div>

              <div className="result-actions">
                <button onClick={handleSellMore} className="btn btn-primary">
                  Try Again
                </button>
                <button
                  onClick={handleBackToWallet}
                  className="btn btn-secondary"
                >
                  Back to Wallet
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="sell-points-page">
      <header className="page-header">
        <h1>Sell Points</h1>
        <p>Convert your points to cash and request a payout</p>
      </header>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={clearError} className="alert-close">
            ×
          </button>
        </div>
      )}

      {/* Current Balance */}
      <section className="current-balance">
        <BalanceCard />
      </section>

      {/* Warning Box */}
      <div className="warning-box important">
        <strong>⚠️ Important Information:</strong>
        <ul>
          <li>
            Points will be <strong>deducted immediately</strong> when you submit
            this request
          </li>
          <li>Payouts are processed manually by administrators</li>
          <li>Processing time varies by payout method</li>
          <li>
            If your payout is rejected, points will be <strong>restored</strong>{' '}
            to your balance
          </li>
          <li>Make sure your payout details are correct before submitting</li>
        </ul>
      </div>

      <div className="sell-points-form">
        {/* Step 1: Amount Selection */}
        <section className="form-section">
          <h2>1. Select Amount</h2>
          <ExchangeRateSelector
            mode="sell"
            onAmountChange={handleAmountChange}
            defaultCurrency={formData.currency}
          />

          {formData.points_amount > 0 &&
            !hasSufficientBalance(formData.points_amount) && (
              <div className="alert alert-warning">
                Insufficient balance. You have{' '}
                {wallet?.available_balance.toLocaleString()} points available.
              </div>
            )}
        </section>

        {/* Step 2: Payout Method */}
        <section className="form-section">
          <h2>2. Select Payout Method</h2>
          <div className="payout-methods">
            {payoutMethods.map(method => (
              <div
                key={method.id}
                className={`payout-method ${
                  formData.payout_method === method.id ? 'selected' : ''
                }`}
                onClick={() => handlePayoutMethodChange(method.id)}
              >
                <input
                  type="radio"
                  name="payout_method"
                  value={method.id}
                  checked={formData.payout_method === method.id}
                  onChange={() => handlePayoutMethodChange(method.id)}
                />
                <div className="method-info">
                  <span className="method-name">{method.name}</span>
                  <span className="method-description">
                    Processing: {method.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Payout-specific fields */}
          {formData.payout_method === 'bank_transfer' && (
            <div className="payout-details">
              <h3>Bank Transfer Details</h3>
              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={formData.payout_details.bank_name || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('bank_name', e.target.value)
                  }
                  placeholder="e.g., Chase Bank"
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  value={formData.payout_details.account_holder || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('account_holder', e.target.value)
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.payout_details.account_number || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('account_number', e.target.value)
                  }
                  placeholder="1234567890"
                  required
                />
              </div>
              <div className="form-group">
                <label>Routing Number (if applicable)</label>
                <input
                  type="text"
                  value={formData.payout_details.routing_number || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('routing_number', e.target.value)
                  }
                  placeholder="123456789"
                />
              </div>
              <div className="form-group">
                <label>SWIFT/BIC Code (for international)</label>
                <input
                  type="text"
                  value={formData.payout_details.swift_code || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('swift_code', e.target.value)
                  }
                  placeholder="CHASUS33"
                />
              </div>
            </div>
          )}

          {formData.payout_method === 'paypal' && (
            <div className="payout-details">
              <h3>PayPal Details</h3>
              <div className="form-group">
                <label>PayPal Email *</label>
                <input
                  type="email"
                  value={formData.payout_details.paypal_email || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('paypal_email', e.target.value)
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
          )}

          {formData.payout_method === 'mobile_money' && (
            <div className="payout-details">
              <h3>Mobile Money Details</h3>
              <div className="form-group">
                <label>Provider *</label>
                <select
                  value={formData.payout_details.provider || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('provider', e.target.value)
                  }
                  required
                >
                  <option value="">Select provider</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  value={formData.payout_details.mobile_number || ''}
                  onChange={e =>
                    handlePayoutDetailsChange('mobile_number', e.target.value)
                  }
                  placeholder="+880 1234 567890"
                  required
                />
              </div>
            </div>
          )}
        </section>

        {/* Summary */}
        {formData.cash_amount && formData.points_amount && (
          <section className="form-section summary">
            <h2>Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Points to Sell:</span>
                <span className="amount">
                  {formData.points_amount.toLocaleString()} points
                </span>
              </div>
              <div className="summary-row">
                <span>You'll Receive:</span>
                <span className="amount highlight">
                  {formData.currency} {formData.cash_amount}
                </span>
              </div>
              <div className="summary-row">
                <span>Exchange Rate:</span>
                <span>
                  1 {formData.currency} = {formData.rate} points
                </span>
              </div>
              <div className="summary-row">
                <span>Payout Method:</span>
                <span>
                  {payoutMethods.find(m => m.id === formData.payout_method)
                    ?.name || 'Not selected'}
                </span>
              </div>
              <div className="summary-row">
                <span>Processing Time:</span>
                <span>
                  {payoutMethods.find(m => m.id === formData.payout_method)
                    ?.description || 'N/A'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            onClick={() => navigate('/wallet')}
            className="btn btn-secondary"
            disabled={pendingOperation}
          >
            Cancel
          </button>
          <button
            onClick={handleReviewClick}
            className="btn btn-primary btn-danger"
            disabled={!isFormValid() || pendingOperation}
          >
            {pendingOperation ? (
              <>
                <LoadingSpinner /> Processing...
              </>
            ) : (
              'Review Payout Request'
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal with EXPLICIT CONFIRMATION */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPayout}
        title="⚠️ Confirm Payout Request"
        message="This action will immediately deduct points from your balance. Please review carefully."
        details={[
          {
            label: 'Points to Sell',
            value: `${formData.points_amount?.toLocaleString()} pts`,
          },
          {
            label: "You'll Receive",
            value: `${formData.currency} ${formData.cash_amount}`,
          },
          {
            label: 'Payout Method',
            value: payoutMethods.find(m => m.id === formData.payout_method)
              ?.name,
          },
          {
            label: 'Processing Time',
            value: payoutMethods.find(m => m.id === formData.payout_method)
              ?.description,
          },
        ]}
        confirmText="Submit Payout Request"
        isDestructive={true}
        isLoading={pendingOperation === 'sell'}
        requiresExplicitConfirm={true}
      />
    </div>
  );
};

export default SellPoints;

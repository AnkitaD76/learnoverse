import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import ExchangeRateSelector from '../../components/wallet/ExchangeRateSelector';
import ConfirmationModal from '../../components/wallet/ConfirmationModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

/**
 * BUY POINTS PAGE
 *
 * Purchase points with cash.
 *
 * FLOW:
 * 1. Select currency
 * 2. Enter amount (cash or points)
 * 3. Select payment method
 * 4. Review and confirm
 * 5. Submit → Wait for backend response
 * 6. Show success/failure
 * 7. Redirect to wallet
 *
 * CRITICAL:
 * - Disable submit during pending
 * - Show transaction status
 * - Never assume success
 */
const BuyPoints = () => {
  const navigate = useNavigate();
  const { wallet, buyPoints, pendingOperation, error, clearError } =
    useWallet();

  const [step, setStep] = useState(1); // 1: form, 2: confirm, 3: result
  const [formData, setFormData] = useState({
    currency: 'USD',
    cash_amount: null,
    points_amount: null,
    rate: null,
    payment_method: '',
    payment_details: {},
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card (Stripe)',
      description: 'Instant',
    },
    { id: 'paypal', name: 'PayPal', description: '1-2 business days' },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: '2-3 business days',
    },
    {
      id: 'bkash',
      name: 'Mobile Money (bKash/Nagad)',
      description: 'Instant',
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

  const handlePaymentMethodChange = methodId => {
    setFormData(prev => ({
      ...prev,
      payment_method: methodId,
    }));
  };

  const handlePaymentDetailsChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      payment_details: {
        ...prev.payment_details,
        [key]: value,
      },
    }));
  };

  const isFormValid = () => {
    return (
      formData.cash_amount > 0 &&
      formData.points_amount > 0 &&
      formData.payment_method
    );
  };

  const handleReviewClick = () => {
    if (!isFormValid()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    clearError();

    const purchaseData = {
      currency: formData.currency,
      cash_amount: formData.cash_amount,
      payment_method: formData.payment_method,
      payment_details: formData.payment_details,
    };

    const result = await buyPoints(purchaseData);

    setTransactionResult(result);
    setShowConfirmModal(false);
    setStep(3);
  };

  const handleBackToWallet = () => {
    navigate('/wallet');
  };

  const handleBuyMore = () => {
    setStep(1);
    setFormData({
      currency: formData.currency,
      cash_amount: null,
      points_amount: null,
      rate: null,
      payment_method: '',
      payment_details: {},
    });
    setTransactionResult(null);
    clearError();
  };

  // Result Screen
  if (step === 3 && transactionResult) {
    return (
      <div className="buy-points-page result-page">
        <div className="result-container">
          {transactionResult.success ? (
            <>
              <div className="result-icon success">✓</div>
              <h1>Purchase Successful!</h1>
              <p className="result-message">
                Your points have been added to your wallet.
              </p>

              <div className="result-details">
                <div className="detail-row">
                  <span>Points Purchased:</span>
                  <span className="highlight">
                    +
                    {(
                      transactionResult.data.transaction.points_amount || 0
                    ).toLocaleString()}{' '}
                    pts
                  </span>
                </div>
                <div className="detail-row">
                  <span>Amount Paid:</span>
                  <span>
                    {transactionResult.data.transaction.currency}{' '}
                    {transactionResult.data.transaction.cash_amount}
                  </span>
                </div>
                <div className="detail-row">
                  <span>New Balance:</span>
                  <span className="highlight">
                    {(
                      transactionResult.data.wallet.available_balance || 0
                    ).toLocaleString()}{' '}
                    pts
                  </span>
                </div>
                <div className="detail-row">
                  <span>Transaction ID:</span>
                  <span className="transaction-id">
                    {transactionResult.data.transaction.transaction_id}
                  </span>
                </div>
              </div>

              <div className="result-actions">
                <button
                  onClick={handleBackToWallet}
                  className="btn btn-primary"
                >
                  Back to Wallet
                </button>
                <button onClick={handleBuyMore} className="btn btn-secondary">
                  Buy More Points
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="result-icon error">✗</div>
              <h1>Purchase Failed</h1>
              <p className="result-message error">
                {transactionResult.error ||
                  'An error occurred during the purchase.'}
              </p>

              <div className="result-actions">
                <button onClick={handleBuyMore} className="btn btn-primary">
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
    <div className="buy-points-page">
      <header className="page-header">
        <h1>Buy Points</h1>
        <p>Purchase points to enroll in courses and access premium content</p>
      </header>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={clearError} className="alert-close">
            ×
          </button>
        </div>
      )}

      <div className="buy-points-form">
        {/* Step 1: Amount Selection */}
        <section className="form-section">
          <h2>1. Select Amount</h2>
          <ExchangeRateSelector
            mode="buy"
            onAmountChange={handleAmountChange}
            defaultCurrency={formData.currency}
          />
        </section>

        {/* Step 2: Payment Method */}
        <section className="form-section">
          <h2>2. Select Payment Method</h2>
          <div className="payment-methods">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className={`payment-method ${
                  formData.payment_method === method.id ? 'selected' : ''
                }`}
                onClick={() => handlePaymentMethodChange(method.id)}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method.id}
                  checked={formData.payment_method === method.id}
                  onChange={() => handlePaymentMethodChange(method.id)}
                />
                <div className="method-info">
                  <span className="method-name">{method.name}</span>
                  <span className="method-description">
                    {method.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment-specific fields */}
          {formData.payment_method === 'bank_transfer' && (
            <div className="payment-details">
              <h3>Bank Transfer Details</h3>
              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  type="text"
                  value={formData.payment_details.account_name || ''}
                  onChange={e =>
                    handlePaymentDetailsChange('account_name', e.target.value)
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={formData.payment_details.account_number || ''}
                  onChange={e =>
                    handlePaymentDetailsChange('account_number', e.target.value)
                  }
                  placeholder="1234567890"
                />
              </div>
            </div>
          )}

          {formData.payment_method === 'bkash' && (
            <div className="payment-details">
              <h3>Mobile Money Details</h3>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={formData.payment_details.mobile_number || ''}
                  onChange={e =>
                    handlePaymentDetailsChange('mobile_number', e.target.value)
                  }
                  placeholder="+880 1234 567890"
                />
              </div>
              <div className="form-group">
                <label>Provider</label>
                <select
                  value={formData.payment_details.provider || ''}
                  onChange={e =>
                    handlePaymentDetailsChange('provider', e.target.value)
                  }
                >
                  <option value="">Select provider</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                </select>
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
                <span>You Pay:</span>
                <span className="amount">
                  {formData.currency} {formData.cash_amount}
                </span>
              </div>
              <div className="summary-row">
                <span>You Get:</span>
                <span className="amount highlight">
                  {formData.points_amount.toLocaleString()} points
                </span>
              </div>
              <div className="summary-row">
                <span>Exchange Rate:</span>
                <span>
                  1 {formData.currency} = {formData.rate} points
                </span>
              </div>
              <div className="summary-row">
                <span>Payment Method:</span>
                <span>
                  {paymentMethods.find(m => m.id === formData.payment_method)
                    ?.name || 'Not selected'}
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
            className="btn btn-primary"
            disabled={!isFormValid() || pendingOperation}
          >
            {pendingOperation ? (
              <>
                <LoadingSpinner /> Processing...
              </>
            ) : (
              'Review Purchase'
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPurchase}
        title="Confirm Purchase"
        message="Please review your purchase details before confirming."
        details={[
          {
            label: 'Amount to Pay',
            value: `${formData.currency} ${formData.cash_amount}`,
          },
          {
            label: 'Points to Receive',
            value: `${formData.points_amount?.toLocaleString()} pts`,
          },
          {
            label: 'Payment Method',
            value: paymentMethods.find(m => m.id === formData.payment_method)
              ?.name,
          },
        ]}
        confirmText="Confirm Purchase"
        isLoading={pendingOperation === 'buy'}
      />
    </div>
  );
};

export default BuyPoints;

# Wallet System Frontend Architecture

## Overview

The wallet system frontend provides a complete, production-ready client-side implementation for the point-based virtual payment system. It follows fintech-grade UX principles with emphasis on **reliability**, **transparency**, and **user trust**.

## Core Principles

### 1. **Backend is the Single Source of Truth**

- Never cache balance locally
- Always fetch fresh data from backend
- No optimistic updates
- Display loading states during API calls

### 2. **Explicit User Actions**

- Financial operations require explicit confirmation
- Irreversible actions require typing "CONFIRM"
- Show transaction details before submission
- Disable actions during pending operations

### 3. **Transparent State Communication**

- Show pending, completed, and failed states
- Display error messages from backend
- Refresh wallet after every mutation
- Clear visual feedback for all operations

### 4. **Error Handling**

- Never assume API success
- Display backend error messages
- Provide recovery options
- Prevent double submissions

---

## Architecture

### File Structure

```
client/src/
├── api/
│   ├── client.js              # Axios instance with auth interceptors
│   └── wallet.js              # Wallet API service layer
├── contexts/
│   ├── SessionContext.jsx     # Auth state management
│   └── WalletContext.jsx      # Wallet state management
├── components/
│   └── wallet/
│       ├── BalanceCard.jsx           # Display balance with stats
│       ├── StatusBadge.jsx           # Transaction/payout status
│       ├── TransactionItem.jsx       # Single transaction display
│       ├── ConfirmationModal.jsx     # Generic confirmation dialog
│       └── ExchangeRateSelector.jsx  # Currency conversion UI
├── pages/
│   ├── Wallet/
│   │   └── page.jsx           # Wallet dashboard
│   ├── BuyPoints/
│   │   └── page.jsx           # Purchase points
│   ├── SellPoints/
│   │   └── page.jsx           # Request payout
│   └── TransactionHistory/
│       └── page.jsx           # View all transactions
├── router/
│   └── index.jsx              # Route definitions
└── styles/
    └── wallet.css             # Wallet-specific styles
```

---

## Layer Architecture

### 1. **API Service Layer** (`api/wallet.js`)

**Purpose**: Abstract all backend communication.

**Functions**:

- `getWalletBalance()` - Fetch wallet data
- `getTransactionHistory(params)` - Paginated transaction list
- `getExchangeRates()` - Current exchange rates
- `buyPoints(data)` - Purchase points
- `sellPoints(data)` - Request payout
- `getPayoutRequests(params)` - Payout request history
- `calculatePoints(cash, rate)` - Client-side calculation helper
- `calculateCash(points, rate)` - Client-side calculation helper

**Design Principles**:

```javascript
/**
 * PRINCIPLES:
 * - Never cache balance locally
 * - Always get fresh data from backend
 * - Handle errors at service level
 * - Return consistent data structures
 */
```

**Example**:

```javascript
// ✅ CORRECT: Always fetch from backend
const data = await getWalletBalance();
setWallet(data.wallet);

// ❌ WRONG: Don't cache or calculate locally
const newBalance = wallet.points_balance + purchasedPoints; // NO!
```

---

### 2. **Context Layer** (`contexts/WalletContext.jsx`)

**Purpose**: Centralized wallet state management.

**State**:

- `wallet` - Current wallet object
- `exchangeRates` - Current exchange rates
- `recentTransactions` - Recent transaction summary
- `isLoading` - Loading state
- `error` - Error message
- `pendingOperation` - Prevent double submit ('buy' | 'sell' | null)

**Methods**:

- `refreshWallet()` - Fetch latest wallet data
- `refreshExchangeRates()` - Fetch latest rates
- `buyPoints(data)` - Purchase points
- `sellPoints(data)` - Request payout
- `clearError()` - Clear error state
- `hasSufficientBalance(amount)` - Check if user can afford
- `getRate(currency)` - Get exchange rate for currency

**Critical Flow**:

```javascript
// Purchase points flow
const buyPoints = async purchaseData => {
    // 1. Prevent double submit
    if (pendingOperation)
        return { success: false, error: 'Operation in progress' };

    try {
        setPendingOperation('buy');

        // 2. Call backend API
        const data = await walletApi.buyPoints(purchaseData);

        // 3. Refresh wallet to get updated balance
        await refreshWallet();

        return { success: true, data };
    } catch (err) {
        // 4. Handle errors
        setError(err.response?.data?.message || 'Failed to purchase points');
        return { success: false, error: errorMessage };
    } finally {
        // 5. Clear pending state
        setPendingOperation(null);
    }
};
```

**Auto-Refresh**:

```javascript
// Refresh wallet when user logs in/out
useEffect(() => {
    if (isAuthenticated) {
        refreshWallet();
        refreshExchangeRates();
    } else {
        setWallet(null);
    }
}, [isAuthenticated]);
```

---

### 3. **Component Layer**

#### **BalanceCard** (`components/wallet/BalanceCard.jsx`)

**Purpose**: Display wallet balance with stats.

**Features**:

- Show available vs reserved points
- Cash equivalent display
- Refresh button
- Expandable details (total earned/spent)
- Loading state

**Props**:

- `showDetails` (boolean) - Show detailed stats
- `className` (string) - Additional CSS classes

**Usage**:

```jsx
<BalanceCard showDetails={true} />
```

---

#### **TransactionItem** (`components/wallet/TransactionItem.jsx`)

**Purpose**: Single transaction display in a list.

**Features**:

- Type icon (💰 purchase, 💸 sale, 📚 enrollment)
- Amount with +/- indicator
- Status badge
- Timestamp
- Expandable metadata

**Props**:

- `transaction` (object) - Transaction data
- `showDetails` (boolean) - Show metadata

**Usage**:

```jsx
{
    transactions.map(tx => (
        <TransactionItem
            key={tx.transaction_id}
            transaction={tx}
            showDetails={true}
        />
    ));
}
```

---

#### **StatusBadge** (`components/wallet/StatusBadge.jsx`)

**Purpose**: Visual indicator for transaction/payout status.

**Statuses**:

- `completed` - Green
- `pending` - Yellow
- `failed` - Red
- `processing` - Blue
- `approved` - Light green

**Props**:

- `status` (string) - Status value
- `className` (string) - Additional CSS classes

**Usage**:

```jsx
<StatusBadge status="pending" />
```

---

#### **ConfirmationModal** (`components/wallet/ConfirmationModal.jsx`)

**Purpose**: Generic confirmation dialog for financial operations.

**Features**:

- Clear action description
- Transaction details list
- Warning for irreversible actions
- Explicit confirmation (type "CONFIRM")
- Disabled confirm during pending
- Cancel always available

**Props**:

- `isOpen` (boolean) - Show/hide modal
- `onClose` (function) - Close handler
- `onConfirm` (function) - Confirm handler
- `title` (string) - Modal title
- `message` (string) - Description
- `details` (array) - `[{ label, value }]`
- `confirmText` (string) - Confirm button text
- `cancelText` (string) - Cancel button text
- `isDestructive` (boolean) - Red styling
- `isLoading` (boolean) - Pending state
- `requiresExplicitConfirm` (boolean) - Require typing "CONFIRM"

**Usage**:

```jsx
<ConfirmationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleConfirm}
  title="⚠️ Confirm Payout Request"
  message="This will immediately deduct points from your balance."
  details={[
    { label: 'Points to Sell', value: `${points} pts` },
    { label: 'You'll Receive', value: `USD ${cash}` },
  ]}
  confirmText="Submit Request"
  isDestructive={true}
  isLoading={pending}
  requiresExplicitConfirm={true}
/>
```

---

#### **ExchangeRateSelector** (`components/wallet/ExchangeRateSelector.jsx`)

**Purpose**: Currency selector with live conversion.

**Features**:

- Currency dropdown
- Bi-directional conversion (cash ↔ points)
- Live calculation
- Rate display

**Props**:

- `mode` (string) - 'buy' or 'sell'
- `onAmountChange` (function) - Callback with `{ currency, cash_amount, points_amount, rate }`
- `defaultCurrency` (string) - Initial currency

**Usage**:

```jsx
<ExchangeRateSelector
    mode="buy"
    onAmountChange={data => {
        setFormData(prev => ({ ...prev, ...data }));
    }}
    defaultCurrency="USD"
/>
```

---

### 4. **Page Layer**

#### **Wallet Dashboard** (`pages/Wallet/page.jsx`)

**Purpose**: Main wallet overview.

**Features**:

- Balance card with stats
- Recent transactions (last 5)
- Quick actions (buy/sell/history)
- How points work info cards

**Route**: `/wallet`

**Components Used**:

- BalanceCard (with details)
- TransactionItem (recent)
- Quick action cards

---

#### **Buy Points** (`pages/BuyPoints/page.jsx`)

**Purpose**: Purchase points with cash.

**Flow**:

1. Select currency and amount
2. Choose payment method
3. Review and confirm
4. Submit → wait for backend
5. Show success/failure
6. Options: back to wallet or buy more

**Route**: `/wallet/buy`

**Features**:

- ExchangeRateSelector
- Payment method selection
- Payment-specific fields (bank transfer, PayPal, mobile money)
- Summary preview
- Confirmation modal
- Result screen with transaction details

**Critical UX**:

- Disable submit during pending
- Show transaction status
- Clear error messages
- "Buy More" and "Back to Wallet" options

---

#### **Sell Points** (`pages/SellPoints/page.jsx`)

**Purpose**: Request payout by selling points.

**Flow**:

1. Check available balance
2. Select currency and points to sell
3. Enter payout details
4. Review with WARNING (irreversible)
5. Type "CONFIRM" to proceed
6. Submit → points debited immediately
7. Show success/failure
8. Options: view payouts or back to wallet

**Route**: `/wallet/sell`

**Features**:

- Current balance card
- WARNING box (points debited immediately)
- ExchangeRateSelector
- Payout method selection
- Payout-specific fields (bank, PayPal, mobile money)
- Summary preview
- Confirmation modal with explicit confirm
- Result screen with payout request details

**Critical UX**:

- Validate sufficient balance
- Show warnings about irreversibility
- Require typing "CONFIRM"
- Explain that points are debited immediately (escrow)
- Show processing time for each payout method

---

#### **Transaction History** (`pages/TransactionHistory/page.jsx`)

**Purpose**: View all wallet transactions and payout requests.

**Route**: `/wallet/transactions`

**Features**:

- Tab navigation (Transactions | Payout Requests)
- Filters:
    - Type (purchase, sale, enrollment, refund)
    - Status (all, pending, completed, failed)
- Pagination (20 per page)
- TransactionItem list with details
- Payout request list with status
- Empty states
- URL params for filter state

**Critical UX**:

- Always fetch from backend
- Show loading states
- Handle pagination
- Filter state in URL (shareable links)
- Clear empty states

---

## State Flow Diagrams

### Purchase Points Flow

```
User → BuyPoints Page → ExchangeRateSelector → ConfirmationModal
                    ↓
              WalletContext.buyPoints()
                    ↓
              api/wallet.buyPoints()
                    ↓
              POST /api/v1/wallet/buy
                    ↓
         Backend (transaction created)
                    ↓
         WalletContext.refreshWallet()
                    ↓
         GET /api/v1/wallet/balance
                    ↓
         Updated wallet state → UI refresh
```

### Sell Points Flow

```
User → SellPoints Page → ExchangeRateSelector → ConfirmationModal
                    ↓
         Type "CONFIRM" required
                    ↓
              WalletContext.sellPoints()
                    ↓
              api/wallet.sellPoints()
                    ↓
              POST /api/v1/wallet/sell
                    ↓
    Backend (points debited, payout request created)
                    ↓
         WalletContext.refreshWallet()
                    ↓
         GET /api/v1/wallet/balance
                    ↓
    Updated wallet state (reduced balance) → UI refresh
```

---

## Critical UX Patterns

### 1. **Pending Operation Prevention**

```javascript
// In WalletContext
const [pendingOperation, setPendingOperation] = useState(null);

const buyPoints = async data => {
    // Prevent double submit
    if (pendingOperation) {
        return { success: false, error: 'Another operation is in progress' };
    }

    setPendingOperation('buy');
    try {
        // ... API call
    } finally {
        setPendingOperation(null);
    }
};
```

```jsx
// In UI
<button disabled={pendingOperation}>
    {pendingOperation ? 'Processing...' : 'Buy Points'}
</button>
```

---

### 2. **Explicit Confirmation for Destructive Actions**

```jsx
<ConfirmationModal
    requiresExplicitConfirm={true} // User must type "CONFIRM"
    isDestructive={true} // Red styling
    message="⚠️ This action cannot be undone. Points will be debited immediately."
/>
```

---

### 3. **Always Reflect Backend State**

```javascript
// ✅ CORRECT: Refresh wallet after mutation
const result = await buyPoints(data);
await refreshWallet(); // Get fresh balance from backend

// ❌ WRONG: Don't update locally
setWallet(prev => ({
    ...prev,
    points_balance: prev.points_balance + purchasedPoints,
}));
```

---

### 4. **Show Transaction Status**

```javascript
// Result screen
{
    transactionResult.success ? (
        <>
            <h1>Purchase Successful!</h1>
            <div>Transaction ID: {result.data.transaction.transaction_id}</div>
            <div>New Balance: {result.data.wallet.available_balance} pts</div>
        </>
    ) : (
        <>
            <h1>Purchase Failed</h1>
            <p>{transactionResult.error}</p>
            <button onClick={handleRetry}>Try Again</button>
        </>
    );
}
```

---

### 5. **Balance Validation**

```javascript
// Check sufficient balance before allowing action
const isFormValid = () => {
    return (
        formData.points_amount > 0 &&
        hasSufficientBalance(formData.points_amount) &&
        formData.payout_method
    );
};

<button disabled={!isFormValid()}>Request Payout</button>;

{
    formData.points_amount > wallet.available_balance && (
        <div className="alert alert-warning">
            Insufficient balance. You have {wallet.available_balance} points
            available.
        </div>
    );
}
```

---

## Integration with Backend

### API Endpoints Used

| Endpoint                         | Method | Purpose              | Context Method            |
| -------------------------------- | ------ | -------------------- | ------------------------- |
| `/api/v1/wallet/balance`         | GET    | Fetch wallet balance | `refreshWallet()`         |
| `/api/v1/wallet/transactions`    | GET    | Transaction history  | `getTransactionHistory()` |
| `/api/v1/wallet/exchange-rates`  | GET    | Current rates        | `refreshExchangeRates()`  |
| `/api/v1/wallet/buy`             | POST   | Purchase points      | `buyPoints()`             |
| `/api/v1/wallet/sell`            | POST   | Request payout       | `sellPoints()`            |
| `/api/v1/wallet/payout-requests` | GET    | Payout requests      | `getPayoutRequests()`     |

### Authentication

All API calls use the existing `apiClient` (axios instance) with:

- Auth token in headers
- Automatic token refresh
- 401 handling (redirect to login)

```javascript
// api/client.js
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// api/wallet.js uses apiClient
export const getWalletBalance = async () => {
    const response = await apiClient.get('/api/v1/wallet/balance');
    return response.data.data;
};
```

---

## Error Handling

### Service Layer Errors

```javascript
// api/wallet.js
export const buyPoints = async data => {
    try {
        const response = await apiClient.post('/api/v1/wallet/buy', data);
        return response.data.data;
    } catch (error) {
        // Let caller handle errors
        throw error;
    }
};
```

### Context Layer Errors

```javascript
// contexts/WalletContext.jsx
const buyPoints = async data => {
    try {
        const result = await walletApi.buyPoints(data);
        await refreshWallet();
        return { success: true, data: result };
    } catch (err) {
        const errorMessage =
            err.response?.data?.message || 'Failed to purchase points';
        setError(errorMessage);
        return { success: false, error: errorMessage };
    }
};
```

### UI Layer Errors

```jsx
// pages/BuyPoints/page.jsx
const handleConfirm = async () => {
    clearError();
    const result = await buyPoints(formData);

    setTransactionResult(result);

    if (result.success) {
        // Show success screen
    } else {
        // Show error screen with retry option
    }
};

{
    error && (
        <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
        </div>
    );
}
```

---

## Styling

### CSS Architecture

- **Global styles**: `index.css` (Tailwind)
- **Wallet styles**: `styles/wallet.css` (custom)

### Wallet CSS Sections

1. Balance Card
2. Transaction Items
3. Status Badges
4. Confirmation Modal
5. Exchange Rate Selector
6. Pages (Dashboard, Buy, Sell, History)
7. Utilities (alerts, loading, empty states)

### Responsive Design

- Mobile-first approach
- Breakpoint: 768px
- Stack components vertically on mobile
- Full-width buttons on mobile

---

## Testing Checklist

### Functional Tests

- [ ] User can view wallet balance
- [ ] User can buy points (all payment methods)
- [ ] User can sell points (all payout methods)
- [ ] User can view transaction history
- [ ] User can filter transactions
- [ ] User can view payout requests
- [ ] Pagination works correctly
- [ ] Exchange rate conversion is accurate

### UX Tests

- [ ] Pending operations show loading state
- [ ] Buttons disabled during pending
- [ ] No double submissions possible
- [ ] Errors display backend messages
- [ ] Success shows transaction details
- [ ] Confirmation modals work
- [ ] Explicit confirm required for payouts
- [ ] Balance always reflects backend
- [ ] Insufficient balance prevents action

### Edge Cases

- [ ] Wallet doesn't exist (first time user)
- [ ] No transactions yet
- [ ] No exchange rates available
- [ ] API errors handled gracefully
- [ ] Session expires during operation
- [ ] Network failure handling
- [ ] Invalid form data validation

---

## Best Practices

### 1. **Never Trust Local State for Balance**

```javascript
// ✅ CORRECT
const wallet = await getWalletBalance();
setBalance(wallet.available_balance);

// ❌ WRONG
const newBalance = currentBalance + purchasedPoints;
setBalance(newBalance); // Don't calculate locally
```

---

### 2. **Always Show Operation Status**

```javascript
// ✅ CORRECT
{
    pendingOperation && <LoadingSpinner />;
}
{
    transactionResult.success && <SuccessMessage />;
}
{
    transactionResult.error && <ErrorMessage />;
}

// ❌ WRONG
// Silently submit and hope for the best
```

---

### 3. **Validate Before API Calls**

```javascript
// ✅ CORRECT
if (!hasSufficientBalance(amount)) {
    showError('Insufficient balance');
    return;
}

// ❌ WRONG
// Let backend reject and show cryptic error
```

---

### 4. **Use Explicit Confirmations**

```javascript
// ✅ CORRECT (for irreversible actions)
<ConfirmationModal
  requiresExplicitConfirm={true}
  message="Type CONFIRM to proceed"
/>

// ❌ WRONG (just "OK" button)
if (confirm('Are you sure?')) { ... }
```

---

### 5. **Refresh After Mutations**

```javascript
// ✅ CORRECT
await buyPoints(data);
await refreshWallet(); // Get updated balance

// ❌ WRONG
await buyPoints(data);
// Assume success and don't refresh
```

---

## Future Enhancements

1. **Real-time Balance Updates** (WebSocket)
2. **Transaction Export** (CSV/PDF)
3. **Wallet Analytics** (spending charts)
4. **Recurring Purchases** (auto-buy points)
5. **Gift Points** (send to other users)
6. **Wallet Notifications** (low balance alerts)
7. **Multi-currency Wallet** (hold multiple currencies)
8. **Transaction Search** (by ID, description)
9. **Scheduled Payouts** (automatic monthly payouts)
10. **Two-Factor Auth** (for large transactions)

---

## Troubleshooting

### Issue: Balance not updating after purchase

**Solution**: Ensure `refreshWallet()` is called after `buyPoints()`:

```javascript
const result = await buyPoints(data);
if (result.success) {
    await refreshWallet(); // ← Must be here
}
```

---

### Issue: Double submissions

**Solution**: Use `pendingOperation` state:

```javascript
if (pendingOperation) return;
setPendingOperation('buy');
try {
    // ... API call
} finally {
    setPendingOperation(null);
}
```

---

### Issue: Stale exchange rates

**Solution**: Refresh rates on mount and currency change:

```javascript
useEffect(() => {
    refreshExchangeRates();
}, []);

useEffect(() => {
    if (selectedCurrency !== prevCurrency) {
        refreshExchangeRates();
    }
}, [selectedCurrency]);
```

---

## Summary

The wallet frontend is a **production-ready**, **fintech-grade** implementation that prioritizes:

1. **Reliability** - Backend is always the source of truth
2. **Transparency** - Show status, errors, and confirmations
3. **User Trust** - Explicit confirmations, clear warnings
4. **Error Handling** - Graceful degradation, clear messages
5. **Responsive Design** - Works on all devices

**Key Files**:

- `contexts/WalletContext.jsx` - State management
- `api/wallet.js` - API service layer
- `pages/Wallet/` - Dashboard
- `pages/BuyPoints/` - Purchase flow
- `pages/SellPoints/` - Payout flow
- `pages/TransactionHistory/` - History view

**Integration Points**:

- SessionContext for auth state
- apiClient for authenticated requests
- Router for navigation
- Backend API (14 endpoints)

This architecture ensures a **robust, maintainable, and user-friendly** wallet system that handles real money with the care it deserves.

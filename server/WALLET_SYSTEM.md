# VIRTUAL PAYMENT SYSTEM - POINTS & WALLET

## Overview

This system implements a **production-ready ledger-based virtual payment system** for course enrollment using points.

### Core Principles

1. **Immutable Ledger**: All balance changes are recorded in the Transaction model
2. **No Direct Balance Mutation**: Balances are derived from transactions
3. **Atomic Operations**: Enrollment + Payment happen together or not at all
4. **Audit Trail**: Every action is traceable with timestamps and user IDs
5. **Escrow Pattern**: Points are reserved/escrowed during pending operations

---

## Database Models

### 1. Wallet

Stores user's point balance and metadata.

```javascript
{
  userId: ObjectId,           // Reference to User
  points_balance: Number,     // Total points (read-only via transactions)
  reserved_points: Number,    // Points in escrow (pending operations)
  cash_equivalent_balance: Number,  // Mock cash balance
  default_currency: String,   // USD, BDT, EUR, GBP
  total_points_earned: Number,
  total_points_spent: Number,
  last_transaction_at: Date
}
```

**Virtual Fields:**

- `available_balance` = `points_balance - reserved_points`

**Key Methods:**

- `hasSufficientBalance(amount)` - Check if user can spend
- `reservePoints(amount)` - Lock points for pending transaction
- `releaseReservedPoints(amount)` - Unlock escrowed points

**Static Methods:**

- `getOrCreate(userId)` - Get wallet or create if doesn't exist
- `creditPoints(userId, amount)` - Add points (atomic)
- `debitPoints(userId, amount)` - Subtract points (atomic, validated)

---

### 2. Transaction (IMMUTABLE)

Single source of truth for all balance changes.

```javascript
{
  transaction_id: String,     // UUID for idempotency
  userId: ObjectId,
  type: String,               // PURCHASE, SALE, ENROLLMENT, REFUND, ADMIN_CREDIT, etc.
  points_amount: Number,      // Positive=credit, Negative=debit
  cash_amount: Number,
  currency: String,           // USD, BDT, EUR, GBP
  exchange_rate: Number,      // Snapshot of rate at transaction time
  status: String,             // PENDING, COMPLETED, FAILED, REVERSED
  payment_method: String,     // CARD, BKASH, PAYPAL, BANK_TRANSFER
  payment_reference: String,  // Gateway transaction ID (mock)
  related_course: ObjectId,
  related_enrollment: ObjectId,
  related_payout: ObjectId,
  reversal_of: ObjectId,      // For reversals
  admin_user: ObjectId,       // For admin actions
  description: String,
  metadata: Object,
  failure_reason: String,
  completed_at: Date
}
```

**Transaction Types:**

- `PURCHASE` - User buys points with money
- `SALE` - User sells points for cashout
- `ENROLLMENT` - Points spent on course
- `REFUND` - Points returned (compensating transaction)
- `ADMIN_CREDIT` - Admin adds points
- `ADMIN_DEBIT` - Admin removes points
- `BONUS` - Promotional points
- `REVERSAL` - Reverse a previous transaction

**Key Methods:**

- `createAndComplete(data)` - Create transaction in COMPLETED state
- `completeTransaction(id)` - Mark PENDING as COMPLETED
- `failTransaction(id, reason)` - Mark PENDING as FAILED
- `createReversal(originalId, reason)` - Create compensating transaction
- `calculateUserBalance(userId)` - Reconcile balance from transactions

---

### 3. ExchangeRate

Versioned currency conversion rates.

```javascript
{
  currency: String,           // USD, BDT, EUR, GBP
  rate: Number,               // Points per 1 unit of currency
  is_active: Boolean,         // Only one active rate per currency
  effective_from: Date,
  effective_until: Date,
  created_by: ObjectId,
  change_reason: String,
  metadata: Object
}
```

**Example:**

```javascript
{ currency: "USD", rate: 100 }  // 1 USD = 100 points
{ currency: "BDT", rate: 1 }    // 1 BDT = 1 point
```

**Key Methods:**

- `getCurrentRate(currency)` - Get active rate for currency
- `getAllActiveRates()` - Get all active rates
- `calculatePoints(currency, cashAmount)` - Convert cash to points
- `calculateCash(currency, pointsAmount)` - Convert points to cash
- `setNewRate(currency, rate, admin, reason)` - Create new rate version

---

### 4. PayoutRequest

Tracks point-to-cash conversion requests.

```javascript
{
  userId: ObjectId,
  points_amount: Number,      // Points being sold
  cash_amount: Number,        // Cash to be paid out
  currency: String,
  exchange_rate: Number,      // Rate snapshot
  payout_method: String,      // BANK_TRANSFER, BKASH, PAYPAL, CARD
  payout_details: {
    account_number: String,
    bank_name: String,
    phone_number: String,     // for bKash
    email: String             // for PayPal
  },
  status: String,             // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
  transaction_id: ObjectId,   // Related debit transaction
  payment_reference: String,
  failure_reason: String,
  requested_at: Date,
  processed_at: Date,
  completed_at: Date,
  admin_notes: String,
  processed_by: ObjectId
}
```

**Flow:**

1. User requests payout → Points debited immediately (escrow)
2. Payout request created with status PENDING
3. Mock payment processor simulates payout
4. If success → Status COMPLETED
5. If failure → Create REFUND transaction, restore points

---

## API Endpoints

### User Wallet Operations

#### GET /api/v1/wallet/balance

Get wallet balance and summary.

**Auth Required:** Yes

**Response:**

```json
{
  "wallet": {
    "points_balance": 5000,
    "reserved_points": 0,
    "available_balance": 5000,
    "cash_equivalent_balance": 50.00,
    "default_currency": "USD",
    "total_points_earned": 10000,
    "total_points_spent": 5000,
    "last_transaction_at": "2025-12-19T10:30:00Z"
  },
  "recent_transactions": [...],
  "calculated_balance": {
    "total_points": 5000,
    "total_credits": 10000,
    "total_debits": 5000
  }
}
```

---

#### GET /api/v1/wallet/transactions

Get transaction history with filters.

**Auth Required:** Yes

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `type` - Filter by transaction type
- `status` - Filter by status
- `startDate` - Filter from date
- `endDate` - Filter to date

**Response:**

```json
{
  "transactions": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

#### GET /api/v1/wallet/exchange-rates

Get current exchange rates.

**Auth Required:** Yes

**Response:**

```json
{
    "exchange_rates": [
        {
            "currency": "USD",
            "rate": 100,
            "effective_from": "2025-01-01T00:00:00Z",
            "description": "1 USD = 100 points"
        },
        {
            "currency": "BDT",
            "rate": 1,
            "effective_from": "2025-01-01T00:00:00Z",
            "description": "1 BDT = 1 point"
        }
    ]
}
```

---

#### POST /api/v1/wallet/buy-points

Purchase points using mock payment.

**Auth Required:** Yes

**Request Body:**

```json
{
    "amount": 50, // Cash amount
    "currency": "USD", // USD, BDT, EUR, GBP
    "payment_method": "CARD", // CARD, BKASH, PAYPAL, BANK_TRANSFER
    "payment_details": {
        // Mock payment info
        "card_number": "4111111111111111",
        "cvv": "123"
    }
}
```

**Response (Success):**

```json
{
    "success": true,
    "message": "Points purchased successfully",
    "transaction": {
        "id": "...",
        "transaction_id": "uuid-here",
        "points_purchased": 5000,
        "amount_paid": 50,
        "currency": "USD",
        "exchange_rate": 100,
        "payment_reference": "MOCK_CARD_1234567890_abc123"
    },
    "wallet": {
        "points_balance": 10000,
        "available_balance": 10000
    }
}
```

**Mock Payment Simulation:**

- 90% success rate
- 1 second processing delay
- Random failure reasons if failed

**TODO for Production:**
Replace mock payment with real gateway:

```javascript
// Stripe Example
const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: currency.toLowerCase(),
    metadata: { userId, points: calculatedPoints },
});

// bKash Example
const bkashResponse = await bkash.createPayment({
    amount,
    merchantInvoiceNumber: transactionId,
    intent: 'sale',
});
```

---

#### POST /api/v1/wallet/sell-points

Sell points for cash (payout request).

**Auth Required:** Yes

**Request Body:**

```json
{
    "points": 1000,
    "currency": "USD",
    "payout_method": "BANK_TRANSFER",
    "payout_details": {
        "account_number": "1234567890",
        "account_name": "John Doe",
        "bank_name": "Example Bank",
        "routing_number": "123456789"
    }
}
```

**Validation:**

- Minimum payout: 100 points
- Sufficient balance check
- Points debited immediately (escrowed)

**Response:**

```json
{
    "success": true,
    "message": "Payout request created successfully",
    "payout": {
        "id": "...",
        "points_sold": 1000,
        "cash_amount": 10.0,
        "currency": "USD",
        "exchange_rate": 100,
        "payout_method": "BANK_TRANSFER",
        "status": "PENDING",
        "estimated_processing_time": "1-3 business days"
    },
    "wallet": {
        "points_balance": 4000,
        "available_balance": 4000
    }
}
```

**Background Processing:**
Mock payout processor runs async (2-5 second delay):

- 95% success rate
- If success → Payout COMPLETED
- If failure → Create REFUND transaction, restore points

---

#### GET /api/v1/wallet/payouts

Get payout request history.

**Auth Required:** Yes

**Query Parameters:**

- `page`, `limit`, `status`

**Response:**

```json
{
  "payouts": [...],
  "pagination": {...}
}
```

---

### Course Enrollment with Points

#### POST /api/v1/courses/:id/enroll-with-points

Enroll in a paid course using points.

**Auth Required:** Yes

**No Request Body Required** (course price is from database)

**Validations:**

1. Course exists and is published
2. User is not the instructor
3. Not already enrolled
4. Course has a price > 0
5. Sufficient points balance

**Atomic Transaction:**

- Creates Enrollment record
- Creates ENROLLMENT transaction
- Debits points from wallet
- All-or-nothing (rollback on any failure)

**Response:**

```json
{
    "success": true,
    "message": "Successfully enrolled using points",
    "enrollment": {
        "id": "...",
        "course": {
            "id": "...",
            "title": "Advanced JavaScript"
        },
        "points_paid": 2500,
        "enrolled_at": "2025-12-19T10:45:00Z"
    },
    "transaction": {
        "id": "...",
        "transaction_id": "uuid-here",
        "points_amount": 2500
    },
    "wallet": {
        "previous_balance": 5000,
        "new_balance": 2500,
        "available_balance": 2500
    }
}
```

**Error Cases:**

- Insufficient balance → 400 Bad Request
- Free course → 400 "Use regular enrollment endpoint"
- Already enrolled → 400 "Already enrolled"

---

### Admin Endpoints

All admin endpoints require:

1. Authentication
2. Admin role

Base path: `/api/v1/admin/wallet`

---

#### POST /api/v1/admin/wallet/exchange-rates

Set or update exchange rate.

**Auth Required:** Admin

**Request Body:**

```json
{
    "currency": "USD",
    "rate": 105,
    "reason": "Market adjustment"
}
```

**Behavior:**

- Deactivates old rate for this currency
- Creates new active rate
- Old rate preserved for audit (historical transactions keep original rate)

**Response:**

```json
{
    "success": true,
    "message": "Exchange rate updated successfully",
    "exchange_rate": {
        "currency": "USD",
        "rate": 105,
        "effective_from": "2025-12-19T11:00:00Z",
        "created_by": "admin-user-id",
        "change_reason": "Market adjustment"
    }
}
```

---

#### GET /api/v1/admin/wallet/exchange-rates/history

View historical exchange rates.

**Auth Required:** Admin

**Query Parameters:**

- `currency` - Filter by currency
- `limit` - Number of results (default: 50)

**Response:**

```json
{
  "success": true,
  "count": 10,
  "rates": [
    {
      "currency": "USD",
      "rate": 105,
      "is_active": true,
      "effective_from": "2025-12-19T11:00:00Z",
      "effective_until": null,
      "created_by": {...},
      "change_reason": "Market adjustment"
    },
    {
      "currency": "USD",
      "rate": 100,
      "is_active": false,
      "effective_from": "2025-01-01T00:00:00Z",
      "effective_until": "2025-12-19T11:00:00Z",
      "created_by": null,
      "change_reason": "Initial system setup"
    }
  ]
}
```

---

#### POST /api/v1/admin/wallet/adjust-balance

Manually adjust user's points balance.

**Auth Required:** Admin

**Request Body:**

```json
{
    "targetUserId": "user-id-here",
    "points": 500,
    "type": "CREDIT", // CREDIT or DEBIT
    "reason": "Compensation for system error on 2025-12-18"
}
```

**Validations:**

- `reason` must be at least 10 characters (detailed explanation required)
- For DEBIT, validates sufficient balance
- Creates immutable transaction record

**Response:**

```json
{
    "success": true,
    "message": "Successfully credited 500 points",
    "transaction": {
        "id": "...",
        "transaction_id": "uuid-here",
        "type": "ADMIN_CREDIT",
        "points_amount": 500,
        "reason": "Compensation for system error on 2025-12-18"
    },
    "wallet": {
        "user_id": "user-id-here",
        "new_balance": 5500,
        "available_balance": 5500
    }
}
```

**Audit Trail:**

- Transaction includes `admin_user` field
- Visible in user's transaction history
- Includes detailed reason

---

#### GET /api/v1/admin/wallet/pending-payouts

View pending payout requests.

**Auth Required:** Admin

**Query Parameters:**

- `limit` - Number of results (default: 50)

**Response:**

```json
{
  "success": true,
  "count": 5,
  "payouts": [
    {
      "userId": {...},
      "points_amount": 1000,
      "cash_amount": 10.00,
      "currency": "USD",
      "payout_method": "BANK_TRANSFER",
      "status": "PENDING",
      "requested_at": "2025-12-19T09:00:00Z",
      "payout_details": {...}
    }
  ]
}
```

---

#### POST /api/v1/admin/wallet/payouts/:id/process

Approve or reject a payout request.

**Auth Required:** Admin

**Request Body:**

```json
{
    "action": "APPROVE", // APPROVE or REJECT
    "reason": "Manual approval - verified account"
}
```

**APPROVE Flow:**

- Marks payout as COMPLETED
- Records admin user and notes
- Generates mock payment reference

**REJECT Flow:**

- Marks payout as FAILED
- Creates REFUND transaction
- Credits points back to user wallet
- Records admin user and reason

**Response (APPROVE):**

```json
{
    "success": true,
    "message": "Payout approved successfully",
    "payout": {
        "id": "...",
        "status": "COMPLETED",
        "points_amount": 1000,
        "cash_amount": 10.0,
        "currency": "USD"
    }
}
```

**Response (REJECT):**

```json
{
    "success": true,
    "message": "Payout rejected and points refunded",
    "payout": {
        "id": "...",
        "status": "FAILED",
        "points_refunded": 1000
    },
    "refund_transaction": {
        "id": "...",
        "transaction_id": "uuid-here"
    }
}
```

---

#### GET /api/v1/admin/wallet/statistics

Get system-wide wallet statistics.

**Auth Required:** Admin

**Response:**

```json
{
    "success": true,
    "statistics": {
        "wallets": {
            "total_count": 1500,
            "points_in_circulation": {
                "total_points": 500000,
                "total_reserved": 5000,
                "total_earned": 1000000,
                "total_spent": 500000
            }
        },
        "transactions": [
            { "_id": "PURCHASE", "count": 500, "total_points": 600000 },
            { "_id": "ENROLLMENT", "count": 800, "total_points": -450000 },
            { "_id": "SALE", "count": 100, "total_points": -50000 }
        ],
        "payouts": [
            {
                "_id": "COMPLETED",
                "count": 90,
                "total_points": 45000,
                "total_cash": 450
            },
            {
                "_id": "PENDING",
                "count": 10,
                "total_points": 5000,
                "total_cash": 50
            }
        ]
    }
}
```

---

#### GET /api/v1/admin/wallet/users/:userId/details

Get detailed wallet info for a specific user (admin view).

**Auth Required:** Admin

**Response:**

```json
{
  "success": true,
  "wallet": {...},
  "calculated_balance": {
    "total_points": 5000,
    "total_credits": 10000,
    "total_debits": 5000
  },
  "balance_match": true,           // Wallet balance matches calculated balance
  "recent_transactions": [...],    // Last 20 transactions
  "pending_payouts": [...]         // Active payout requests
}
```

**Balance Reconciliation:**

- Compares wallet balance with sum of completed transactions
- `balance_match: false` indicates data inconsistency (requires investigation)

---

## Financial Integrity Patterns

### 1. Atomic Transactions

All multi-step operations use MongoDB sessions:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
    // Step 1: Create enrollment
    // Step 2: Create transaction
    // Step 3: Debit wallet

    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

### 2. Escrow Pattern

For pending operations, points are reserved:

```javascript
// Sell points flow:
1. Check balance
2. Debit points immediately (escrow)
3. Create payout request (PENDING)
4. If payout fails → Create REFUND transaction, restore points
```

### 3. Compensating Transactions

Never update existing transactions. To reverse:

```javascript
// Original: User bought 100 points
{ type: "PURCHASE", points_amount: +100, status: "COMPLETED" }

// Reversal: Create opposite transaction
{ type: "REVERSAL", points_amount: -100, status: "COMPLETED", reversal_of: originalId }
```

### 4. Idempotency

Each transaction has a UUID:

```javascript
transaction_id: '550e8400-e29b-41d4-a716-446655440000';
```

Prevents duplicate processing if user retries failed request.

### 5. Balance Reconciliation

Admin endpoint compares:

- Wallet balance (cached)
- Sum of completed transactions (source of truth)

Mismatch triggers alert for investigation.

---

## Mock vs Production

### Current Mock Implementation

**Buy Points:**

```javascript
const mockPaymentSuccess = await simulatePaymentProcessing(payment_method);
// Returns: { success: true/false, reference: "MOCK_...", reason: "..." }
```

**Sell Points:**

```javascript
simulatePayoutProcessing(payoutRequestId);
// Async: Updates payout status after 2-5 seconds
```

---

### Upgrading to Production

#### 1. Stripe Integration (Cards)

```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Replace mock in buyPoints():
const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Cents
    currency: currency.toLowerCase(),
    payment_method_types: ['card'],
    metadata: {
        userId,
        points: rateInfo.points,
        transaction_id: transaction[0].transaction_id,
    },
});

// Update transaction with real reference
payment_reference: paymentIntent.id;
```

#### 2. bKash Integration (Bangladesh)

```javascript
import axios from 'axios';

// Get bKash token
const tokenResponse = await axios.post(
    'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
    {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
    }
);

// Create payment
const paymentResponse = await axios.post(
    'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
    {
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: transaction[0].transaction_id,
    },
    {
        headers: {
            authorization: tokenResponse.data.id_token,
            'x-app-key': process.env.BKASH_APP_KEY,
        },
    }
);

payment_reference: paymentResponse.data.paymentID;
```

#### 3. PayPal Integration

```javascript
import paypal from '@paypal/checkout-server-sdk';

const request = new paypal.orders.OrdersCreateRequest();
request.prefer('return=representation');
request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
        {
            amount: {
                currency_code: currency,
                value: amount.toFixed(2),
            },
        },
    ],
});

const order = await paypalClient.execute(request);
payment_reference: order.result.id;
```

#### 4. Bank Transfer (Payout)

```javascript
// For payouts, integrate with banking API
// Example: Stripe Connect, TransferWise API, local banking APIs

const transfer = await stripe.transfers.create({
    amount: Math.round(payout.cash_amount * 100),
    currency: payout.currency.toLowerCase(),
    destination: userBankAccount.stripe_account_id,
    metadata: {
        payout_request_id: payout._id,
        user_id: payout.userId,
    },
});

payment_reference: transfer.id;
```

---

## Database Seeding

### Initial Exchange Rates

Run once during setup:

```javascript
import { seedExchangeRates } from './utils/seedWallet.js';

await seedExchangeRates();
```

Creates default rates:

- USD: 100 points
- BDT: 1 point
- EUR: 110 points
- GBP: 125 points

---

## Security Considerations

### 1. PCI Compliance (Production)

- Never store full card numbers
- Use tokenization (Stripe, PayPal)
- Implement 3D Secure for card payments

### 2. Sensitive Data Encryption

Encrypt payout details in database:

```javascript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
    };
}
```

### 3. Rate Limiting

Prevent abuse of buy/sell endpoints:

```javascript
import rateLimit from 'express-rate-limit';

const walletLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: 'Too many wallet operations, please try again later',
});

app.use('/api/v1/wallet/buy-points', walletLimiter);
```

### 4. Webhook Validation

Validate payment gateway webhooks:

```javascript
// Stripe webhook
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
);

if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update transaction status
}
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('Wallet Operations', () => {
    it('should credit points atomically', async () => {
        const wallet = await Wallet.creditPoints(userId, 100);
        expect(wallet.points_balance).toBe(100);

        const transaction = await Transaction.findOne({
            userId,
            type: 'PURCHASE',
        });
        expect(transaction.points_amount).toBe(100);
    });

    it('should prevent negative balance', async () => {
        const wallet = await Wallet.create({ userId, points_balance: 50 });

        await expect(Wallet.debitPoints(userId, 100)).rejects.toThrow(
            'Insufficient balance'
        );
    });
});
```

### Integration Tests

```javascript
describe('Buy Points Flow', () => {
    it('should purchase points with mock payment', async () => {
        const response = await request(app)
            .post('/api/v1/wallet/buy-points')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                amount: 50,
                currency: 'USD',
                payment_method: 'CARD',
            });

        expect(response.status).toBe(201);
        expect(response.body.transaction.points_purchased).toBe(5000);
    });
});
```

### Race Condition Tests

```javascript
describe('Concurrent Enrollment', () => {
    it('should prevent double-spending', async () => {
        const wallet = await Wallet.create({ userId, points_balance: 1000 });
        const course = await Course.create({ pricePoints: 1000 });

        // Attempt concurrent enrollments
        const promises = [
            enrollInCourseWithPoints(userId, course._id),
            enrollInCourseWithPoints(userId, course._id),
        ];

        const results = await Promise.allSettled(promises);

        // One should succeed, one should fail
        const succeeded = results.filter(r => r.status === 'fulfilled');
        expect(succeeded.length).toBe(1);

        const finalWallet = await Wallet.findOne({ userId });
        expect(finalWallet.points_balance).toBe(0); // Not -1000
    });
});
```

---

## Monitoring & Alerts

### 1. Balance Reconciliation Job

Run daily to detect discrepancies:

```javascript
import cron from 'node-cron';

cron.schedule('0 2 * * *', async () => {
    const wallets = await Wallet.find();

    for (const wallet of wallets) {
        const calculated = await Transaction.calculateUserBalance(
            wallet.userId
        );

        if (wallet.points_balance !== calculated.total_points) {
            console.error(`Balance mismatch for user ${wallet.userId}`);
            // Send alert to admin
            // Log to monitoring system
        }
    }
});
```

### 2. Failed Transaction Monitoring

```javascript
const failedTransactions = await Transaction.find({
    status: 'FAILED',
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24h
});

if (failedTransactions.length > 100) {
    // Alert: High failure rate
}
```

### 3. Pending Payout Tracking

```javascript
const oldPendingPayouts = await PayoutRequest.find({
    status: 'PENDING',
    requested_at: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // >7 days
});

if (oldPendingPayouts.length > 0) {
    // Alert: Payouts stuck in pending
}
```

---

## Future Enhancements

### 1. Points Expiration

Add expiration dates to promotional points:

```javascript
{
  points_expiration: Date,
  expired_points: Number,
}
```

### 2. Points Transfer

Allow users to transfer points to each other:

```javascript
POST /api/v1/wallet/transfer
{
  "to_user_id": "...",
  "points": 100,
  "message": "Gift for helping me"
}
```

Creates two transactions:

- Sender: TRANSFER_OUT (-100 points)
- Receiver: TRANSFER_IN (+100 points)

### 3. Loyalty Program

Reward users for purchases:

```javascript
// On course enrollment, award 5% cashback
const cashback = Math.floor(course.pricePoints * 0.05);
await Transaction.create({
    userId,
    type: 'BONUS',
    points_amount: cashback,
    description: 'Enrollment cashback',
});
```

### 4. Subscription Plans

Monthly point bundles:

```javascript
{
  plan: "PREMIUM",
  monthly_points: 10000,
  price: 80,
  savings: "20% discount"
}
```

### 5. Multi-Currency Wallet

Track separate balances per currency:

```javascript
{
  balances: {
    USD: { points: 5000, cash_equivalent: 50 },
    BDT: { points: 1000, cash_equivalent: 1000 },
  }
}
```

---

## Troubleshooting

### Balance Mismatch

**Problem:** Wallet balance doesn't match transaction sum

**Solution:**

1. Check calculated balance:

```javascript
const calculated = await Transaction.calculateUserBalance(userId);
```

2. Compare with wallet:

```javascript
const wallet = await Wallet.findOne({ userId });
console.log(
    `Wallet: ${wallet.points_balance}, Calculated: ${calculated.total_points}`
);
```

3. If mismatch, trigger reconciliation (create adjustment transaction)

---

### Failed Payments Not Rolled Back

**Problem:** Transaction marked FAILED but points were credited

**Investigation:**

```javascript
const suspiciousTransactions = await Transaction.find({
    status: 'FAILED',
    type: 'PURCHASE',
});

for (const tx of suspiciousTransactions) {
    // Check if wallet was incorrectly credited
    const wallet = await Wallet.findOne({ userId: tx.userId });
    // Create reversal if needed
}
```

---

### Pending Payouts Stuck

**Problem:** Payout status PENDING for too long

**Solution:**

1. Check background job logs
2. Manually process via admin endpoint:

```http
POST /api/v1/admin/wallet/payouts/:id/process
{
  "action": "APPROVE",
  "reason": "Manual intervention - job failed"
}
```

---

## Summary

This implementation provides:

✅ **Ledger-based accounting** - Every balance change is traceable  
✅ **Atomic transactions** - All-or-nothing for complex operations  
✅ **Audit trail** - Immutable transaction history  
✅ **Escrow pattern** - Points reserved during pending operations  
✅ **Admin controls** - Exchange rates, balance adjustments, payout approval  
✅ **Mock payments** - Ready for production gateway integration  
✅ **Extensible** - Easy to add new features (transfers, subscriptions, etc.)

The system is **production-ready** in terms of architecture and can be upgraded to real payment gateways by replacing the mock functions with actual SDK calls.

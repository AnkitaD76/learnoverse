# WALLET SYSTEM - SETUP GUIDE

## Prerequisites

- Node.js (v16+)
- MongoDB (v5+)
- Existing learnovers project setup

## Installation Steps

### 1. Install Required Packages

```bash
cd server
npm install uuid
```

The `uuid` package is used for generating unique transaction IDs for idempotency.

### 2. Seed Exchange Rates

Add this to your server startup or run separately:

```javascript
// In server/src/server.js or create a separate seed script

import { seedExchangeRates } from './utils/seedWallet.js';

const start = async () => {
    try {
        await connectDB(MONGO_URI);

        // Seed exchange rates (only runs if none exist)
        await seedExchangeRates();

        app.listen(port, () =>
            console.log(`🚀 Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
};
```

**OR** Create a standalone seed script:

```bash
# Create server/src/scripts/seedWallet.js
```

```javascript
import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../db/connectDB.js';
import { seedExchangeRates } from '../utils/seedWallet.js';

const seed = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        await seedExchangeRates();
        console.log('✅ Wallet system seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seed();
```

Run: `node src/scripts/seedWallet.js`

### 3. Update Enrollment Model (Optional)

If your Enrollment model doesn't have payment fields, add them:

```javascript
// In server/src/models/Enrollment.js

paymentMethod: {
  type: String,
  enum: ['POINTS', 'EXTERNAL', null],
  default: null,
},
pointsPaid: {
  type: Number,
  default: 0,
  min: 0,
},
```

### 4. Environment Variables (Optional)

For production payment gateways, add to `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# bKash (Bangladesh)
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Encryption (for sensitive payout details)
ENCRYPTION_KEY=generate_a_32_byte_hex_key_here
```

Generate encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing the System

### 1. Start the Server

```bash
cd server
npm run dev
```

### 2. Create Test User and Login

Use your existing auth endpoints to register and login.

### 3. Test Wallet Endpoints

Use the provided `wallet-api-tests.http` file with REST Client or Postman.

#### Quick Test Flow:

**A. Buy Points**

```http
POST http://localhost:3000/api/v1/wallet/buy-points
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "amount": 50,
  "currency": "USD",
  "payment_method": "CARD"
}
```

**B. Check Balance**

```http
GET http://localhost:3000/api/v1/wallet/balance
Authorization: Bearer YOUR_TOKEN
```

**C. View Transactions**

```http
GET http://localhost:3000/api/v1/wallet/transactions
Authorization: Bearer YOUR_TOKEN
```

**D. Enroll in Course with Points**

```http
POST http://localhost:3000/api/v1/courses/COURSE_ID/enroll-with-points
Authorization: Bearer YOUR_TOKEN
```

**E. Sell Points**

```http
POST http://localhost:3000/api/v1/wallet/sell-points
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "points": 500,
  "currency": "USD",
  "payout_method": "BANK_TRANSFER",
  "payout_details": {
    "account_number": "1234567890",
    "account_name": "John Doe",
    "bank_name": "Example Bank"
  }
}
```

### 4. Test Admin Endpoints

Login as admin user, then:

**A. Set Exchange Rate**

```http
POST http://localhost:3000/api/v1/admin/wallet/exchange-rates
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "currency": "USD",
  "rate": 105,
  "reason": "Market adjustment"
}
```

**B. Credit User Points**

```http
POST http://localhost:3000/api/v1/admin/wallet/adjust-balance
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "targetUserId": "USER_ID",
  "points": 1000,
  "type": "CREDIT",
  "reason": "Promotional bonus for early adopter"
}
```

**C. View System Statistics**

```http
GET http://localhost:3000/api/v1/admin/wallet/statistics
Authorization: Bearer ADMIN_TOKEN
```

## Verifying Installation

### Check Database Collections

After running the server and seed script, verify these collections exist:

```javascript
// In MongoDB shell or Compass:

db.wallets.findOne();
db.transactions.findOne();
db.exchangerates.find();
db.payoutrequests.findOne();
```

### Check Exchange Rates

```javascript
db.exchangerates.find({ is_active: true });
```

Should return:

```json
[
    { "currency": "USD", "rate": 100, "is_active": true },
    { "currency": "BDT", "rate": 1, "is_active": true },
    { "currency": "EUR", "rate": 110, "is_active": true },
    { "currency": "GBP", "rate": 125, "is_active": true }
]
```

## Troubleshooting

### Error: "uuid is not defined"

Install the package:

```bash
npm install uuid
```

### Error: "No active exchange rate found"

Run the seed script:

```bash
node src/scripts/seedWallet.js
```

Or add to server startup (see step 2).

### Error: "Wallet not found"

Wallets are created automatically on first use. Try:

```http
GET http://localhost:3000/api/v1/wallet/balance
```

This will create a wallet if it doesn't exist.

### Balance Mismatch Warnings

If you see console warnings about balance mismatches:

```
⚠️  Balance mismatch for user 123: Wallet=5000, Calculated=4800
```

This indicates a data inconsistency. Use the admin endpoint to check:

```http
GET http://localhost:3000/api/v1/admin/wallet/users/USER_ID/details
Authorization: Bearer ADMIN_TOKEN
```

Check `balance_match` field. If false, investigate recent transactions.

### Mock Payment Always Failing

The mock payment simulator has a 90% success rate. If you need 100% success for testing, modify:

```javascript
// In server/src/controllers/wallet.controller.js

const simulatePaymentProcessing = async paymentMethod => {
    return new Promise(resolve => {
        setTimeout(() => {
            const success = true; // Changed from: Math.random() > 0.1

            if (success) {
                resolve({
                    success: true,
                    reference: `MOCK_${paymentMethod}_${Date.now()}`,
                });
            }
        }, 1000);
    });
};
```

## Next Steps

### 1. Integrate Real Payment Gateways

See `WALLET_SYSTEM.md` section "Mock vs Production" for Stripe, bKash, PayPal examples.

### 2. Add Frontend UI

Create components for:

- Wallet balance display
- Buy points form
- Transaction history table
- Course enrollment with points option
- Sell points form
- Admin dashboard for managing rates and payouts

### 3. Implement Background Jobs

Use a job queue (Bull, Agenda) for:

- Processing payouts asynchronously
- Daily balance reconciliation
- Sending transaction receipts via email
- Monitoring failed transactions

Example with Bull:

```javascript
import Queue from 'bull';

const payoutQueue = new Queue('payouts', {
    redis: { host: 'localhost', port: 6379 },
});

payoutQueue.process(async job => {
    const { payoutRequestId } = job.data;
    await processPayoutWithGateway(payoutRequestId);
});

// Add job when payout requested
await payoutQueue.add({ payoutRequestId });
```

### 4. Add Webhooks for Payment Gateways

Handle async payment confirmations:

```javascript
app.post('/api/v1/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
        const transactionId = event.data.object.metadata.transaction_id;
        await Transaction.completeTransaction(transactionId);
        await Wallet.creditPoints(userId, points);
    }

    res.sendStatus(200);
});
```

### 5. Implement Rate Limiting

Prevent abuse:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const buyPointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many purchase attempts',
});

app.post('/api/v1/wallet/buy-points', buyPointsLimiter, buyPoints);
```

## Support

For questions or issues:

1. Check `WALLET_SYSTEM.md` for detailed documentation
2. Review `wallet-api-tests.http` for example requests
3. Check server logs for error details

## Summary

You now have a fully functional ledger-based virtual payment system with:

✅ Point wallet for each user  
✅ Buy points (mock payment)  
✅ Sell points (mock payout)  
✅ Course enrollment with points  
✅ Immutable transaction history  
✅ Versioned exchange rates  
✅ Admin controls for rates and balance adjustments  
✅ Complete audit trail  
✅ Ready for production payment gateway integration

Next: Integrate with your frontend and replace mock payments with real gateways!

# Wallet System - Quick Start Guide

## 🚀 Start Using the Wallet System

### Prerequisites

- Backend server running on `http://localhost:5000`
- Frontend dev server running on `http://localhost:5173`
- User account created and logged in

---

## 1. Access Your Wallet

Navigate to: **http://localhost:5173/wallet**

You'll see:

- Your points balance
- Cash equivalent
- Recent transactions
- Quick action buttons

---

## 2. Buy Points

### Option A: From Wallet Dashboard

1. Click **"Buy Points"** card
2. Or navigate to: **http://localhost:5173/wallet/buy**

### Steps

1. **Select Currency**: USD, BDT, EUR, or GBP
2. **Enter Amount**: Type cash amount OR points amount (auto-converts)
3. **Choose Payment Method**:
   - Credit/Debit Card (Stripe) - Instant
   - PayPal - 1-2 business days
   - Bank Transfer - 2-3 business days
   - Mobile Money (bKash/Nagad) - Instant

4. **Fill Payment Details** (varies by method):
   - Bank: Account name, number, routing
   - PayPal: Email address
   - Mobile Money: Provider, mobile number

5. **Review Summary**:
   - You Pay: USD 50.00
   - You Get: 5,000 points
   - Exchange Rate: 1 USD = 100 points

6. **Click "Review Purchase"**
7. **Confirm** in modal
8. **Wait for processing** (button shows "Processing...")
9. **Success Screen**:
   - Transaction ID
   - New Balance
   - Options: "Back to Wallet" or "Buy More Points"

---

## 3. Enroll in a Course with Points

### From Course Details Page

1. Navigate to **http://localhost:5173/courses**
2. Click on any course
3. On course details page, you'll see:
   - Course price: `2,500 points`
   - Your balance: `5,000 points`
   - Two enrollment options:
     - **"Enroll (Free)"** - Standard enrollment
     - **"💰 Enroll with Points"** - Pay with wallet points

4. **Click "💰 Enroll with Points"**
5. **Review Enrollment Details**:
   - Course: Advanced JavaScript
   - Cost: 2,500 points
   - Your Balance: 5,000 points
   - Balance After: 2,500 points

6. **Click "Confirm Enrollment"**
7. **Wait for processing**
8. **Success**: Redirected to "My Courses"
9. **Wallet Updated**: Balance now shows 2,500 points

### What Happens Behind the Scenes

```
1. Check balance (5,000 >= 2,500) ✅
2. Start MongoDB transaction
3. Create enrollment record
4. Create ENROLLMENT transaction (debit 2,500)
5. Debit points from wallet
6. Commit transaction (all-or-nothing)
7. Refresh wallet balance
8. Show success message
```

---

## 4. Sell Points (Request Payout)

### From Wallet Dashboard

1. Click **"Sell Points"** card
2. Or navigate to: **http://localhost:5173/wallet/sell**

### Steps

1. **View Current Balance**: Shows available points
2. **Read Warning**:
   - ⚠️ Points debited immediately
   - Manual admin processing
   - Restoration if rejected

3. **Select Amount**:
   - Points to Sell: 1,000
   - Auto-calculates: USD 10.00

4. **Choose Payout Method**:
   - Bank Transfer (2-3 days)
   - PayPal (1-2 days)
   - Mobile Money (24 hours)

5. **Fill Payout Details**:
   - Bank: Bank name, account holder, account number
   - PayPal: Email
   - Mobile Money: Provider, mobile number

6. **Review Summary**:
   - Points to Sell: 1,000 points
   - You'll Receive: USD 10.00
   - Processing Time: 2-3 business days

7. **Click "Review Payout Request"**
8. **⚠️ Type "CONFIRM"** (explicit confirmation required)
9. **Click "Submit Payout Request"**
10. **Success Screen**:
    - Payout Request ID
    - Points Sold: 1,000 points
    - Cash Amount: USD 10.00
    - New Balance: 1,500 points (2,500 - 1,000)
    - Status: PENDING
    - Options: "Back to Wallet" or "View Payout Requests"

---

## 5. View Transaction History

Navigate to: **http://localhost:5173/wallet/transactions**

### Features

- **Two Tabs**:
  - Transactions (all point movements)
  - Payout Requests (cash-out requests)

### Transactions Tab

- **Filters**:
  - Type: All, Purchase, Sale, Enrollment, Refund
  - Status: All, Pending, Completed, Failed

- **View Details**:
  - Transaction ID
  - Type (with icon)
  - Amount (+/-)
  - Status badge
  - Timestamp
  - Expandable metadata (currency, exchange rate, course details)

- **Pagination**: 20 per page

### Payout Requests Tab

- **View**:
  - Points sold → Cash amount
  - Payout method
  - Status (Pending, Approved, Rejected, Completed)
  - Request ID
  - Processing date
  - Admin notes (if any)

---

## 6. Check Your Balance Anytime

### Quick Balance Check

1. Navigate to **http://localhost:5173/wallet**
2. See balance card at top
3. Click **refresh button** (↻) for latest data

### Balance Details

- **Available Points**: Points you can spend
- **Reserved Points**: Points held for pending payouts
- **Total Points**: All points in wallet
- **Cash Equivalent**: Value in your default currency
- **Total Earned**: All points purchased
- **Total Spent**: All points used

---

## 💡 Pro Tips

### 1. Check Balance Before Enrollment

- Always view your balance before trying to enroll
- Insufficient balance = disabled enrollment button
- Tooltip shows why button is disabled

### 2. Transaction Status

- **Green (Completed)**: Transaction successful
- **Yellow (Pending)**: Awaiting action
- **Red (Failed)**: Error occurred
- **Blue (Processing)**: In progress

### 3. Payout Processing Times

- **Instant**: Stripe, Mobile Money
- **1-2 days**: PayPal
- **2-3 days**: Bank Transfer
- **Manual Review**: Admin approval required

### 4. Error Handling

- If transaction fails, error message shows why
- Balance is NOT deducted on failure
- "Try Again" option available
- Contact support if issue persists

### 5. Preventing Double Purchases

- Buttons disabled during processing
- "Processing..." indicator shown
- Modal can't be closed during operation
- Wait for completion before retrying

---

## 🔍 Common Scenarios

### Scenario 1: First Purchase

```
1. New user → Balance: 0 points
2. Buy 5,000 points with USD 50
3. Balance updated: 5,000 points
4. Transaction recorded: PURCHASE type
5. Can now enroll in courses
```

### Scenario 2: Course Enrollment

```
1. Current Balance: 5,000 points
2. Course Cost: 2,500 points
3. Enroll with Points
4. New Balance: 2,500 points
5. Transaction recorded: ENROLLMENT type
6. Enrolled in course
```

### Scenario 3: Cash Out

```
1. Current Balance: 2,500 points
2. Request payout: 1,000 points → USD 10
3. New Balance: 1,500 points (1,000 reserved)
4. Transaction recorded: SALE type
5. Payout Request: PENDING status
6. Admin processes payout
7. Status changes to: COMPLETED
8. USD 10 sent to payout method
```

### Scenario 4: Insufficient Balance

```
1. Current Balance: 1,000 points
2. Course Cost: 2,500 points
3. "Enroll with Points" button DISABLED
4. Tooltip: "Insufficient points balance"
5. Option: Buy more points first
6. After purchase, button becomes enabled
```

---

## 🆘 Troubleshooting

### Issue: "Insufficient Points" Error

**Solution**: Buy more points before enrolling

### Issue: Balance Not Updating

**Solution**: Click refresh button (↻) on balance card

### Issue: Transaction Stuck in "Pending"

**Solution**: Check transaction history for status updates

### Issue: Payout Not Processed

**Solution**: Payouts require manual admin approval (check status in Payout Requests tab)

### Issue: Can't Buy Points

**Solution**:

- Check payment method details are correct
- Ensure backend server is running
- Check browser console for errors

---

## 📱 Mobile Usage

### Responsive Design

- All pages work on mobile devices
- Buttons stack vertically
- Forms are full-width
- Modals fit screen

### Touch-Friendly

- Large tap targets
- Swipe-friendly pagination
- No hover-only actions

---

## 🎓 Learning Resources

- **Architecture Guide**: See [WALLET_FRONTEND.md](WALLET_FRONTEND.md)
- **Implementation Summary**: See [WALLET_IMPLEMENTATION.md](WALLET_IMPLEMENTATION.md)
- **Backend API**: See server/WALLET_SYSTEM.md

---

## 🎉 You're Ready!

Start by:

1. ✅ Checking your balance at `/wallet`
2. ✅ Buying your first points at `/wallet/buy`
3. ✅ Enrolling in a course with points
4. ✅ Viewing your transaction history at `/wallet/transactions`

**Happy Learning! 🚀**

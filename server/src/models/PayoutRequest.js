import mongoose from 'mongoose';

/**
 * PAYOUT REQUEST MODEL
 *
 * Tracks requests to sell points for cash (cashout).
 *
 * PAYOUT FLOW:
 * 1. User requests to sell X points
 * 2. Points are IMMEDIATELY debited from wallet (escrow)
 * 3. Payout request created with status PENDING
 * 4. Mock payment processor "processes" the payout
 * 5. Status changes to COMPLETED or FAILED
 * 6. If FAILED, compensating transaction restores points
 *
 * FINANCIAL INTEGRITY:
 * - Points are escrowed (reserved) immediately to prevent double-spending
 * - If payout fails, points are restored via REVERSAL transaction
 * - All state changes are auditable
 *
 * STATUSES:
 * - PENDING: Payout initiated, awaiting processing
 * - PROCESSING: Being processed by payment system
 * - COMPLETED: Cash sent to user
 * - FAILED: Payout failed, points restored
 * - CANCELLED: User cancelled request
 */
const PayoutRequestSchema = new mongoose.Schema(
    {
        // User requesting the payout
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        // Points being sold
        points_amount: {
            type: Number,
            required: [true, 'Points amount is required'],
            min: [1, 'Points amount must be at least 1'],
            validate: {
                validator: Number.isInteger,
                message: 'Points must be an integer',
            },
        },
        // Cash equivalent to be paid out
        cash_amount: {
            type: Number,
            required: [true, 'Cash amount is required'],
            min: [0.01, 'Cash amount must be greater than 0'],
        },
        // Currency for payout
        currency: {
            type: String,
            enum: ['USD', 'BDT', 'EUR', 'GBP'],
            required: [true, 'Currency is required'],
            uppercase: true,
        },
        // Exchange rate at time of request
        exchange_rate: {
            type: Number,
            required: [true, 'Exchange rate is required'],
        },
        // Payout method
        payout_method: {
            type: String,
            enum: ['BANK_TRANSFER', 'BKASH', 'PAYPAL', 'CARD'],
            required: [true, 'Payout method is required'],
        },
        // Payout destination details (encrypted in production)
        payout_details: {
            account_number: String,
            account_name: String,
            bank_name: String,
            routing_number: String,
            phone_number: String, // for bKash
            email: String, // for PayPal
        },
        // Status of payout
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
            default: 'PENDING',
            required: true,
            index: true,
        },
        // Related transaction (debit transaction)
        transaction_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            required: true,
        },
        // Mock payment reference (in real system, this would be gateway transaction ID)
        payment_reference: {
            type: String,
            default: null,
        },
        // Failure reason (if status is FAILED)
        failure_reason: {
            type: String,
            default: null,
        },
        // Processing timestamps
        requested_at: {
            type: Date,
            default: Date.now,
            required: true,
        },
        processed_at: {
            type: Date,
            default: null,
        },
        completed_at: {
            type: Date,
            default: null,
        },
        // Admin notes (for manual review)
        admin_notes: {
            type: String,
            default: null,
        },
        // Admin who processed (for manual approvals)
        processed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
PayoutRequestSchema.index({ userId: 1, status: 1 });
PayoutRequestSchema.index({ userId: 1, createdAt: -1 });
PayoutRequestSchema.index({ status: 1, requested_at: -1 });

// Static method: Create payout request
PayoutRequestSchema.statics.createRequest = async function (
    userId,
    pointsAmount,
    cashAmount,
    currency,
    exchangeRate,
    payoutMethod,
    payoutDetails,
    transactionId
) {
    const request = await this.create({
        userId,
        points_amount: pointsAmount,
        cash_amount: cashAmount,
        currency,
        exchange_rate: exchangeRate,
        payout_method: payoutMethod,
        payout_details: payoutDetails,
        transaction_id: transactionId,
        status: 'PENDING',
        requested_at: new Date(),
    });

    return request;
};

// Static method: Process payout (mock)
PayoutRequestSchema.statics.processPayout = async function (
    requestId,
    success = true,
    failureReason = null
) {
    const request = await this.findById(requestId);

    if (!request) {
        throw new Error('Payout request not found');
    }

    if (request.status !== 'PENDING' && request.status !== 'PROCESSING') {
        throw new Error('Payout request already processed');
    }

    const update = {
        status: success ? 'COMPLETED' : 'FAILED',
        processed_at: new Date(),
    };

    if (success) {
        update.completed_at = new Date();
        update.payment_reference = `MOCK_PAYOUT_${Date.now()}`; // Mock reference
    } else {
        update.failure_reason = failureReason || 'Payment processing failed';
    }

    const updatedRequest = await this.findByIdAndUpdate(
        requestId,
        { $set: update },
        { new: true }
    );

    return updatedRequest;
};

// Static method: Get pending payouts (for admin review)
PayoutRequestSchema.statics.getPendingPayouts = async function (limit = 50) {
    const payouts = await this.find({
        status: { $in: ['PENDING', 'PROCESSING'] },
    })
        .populate('userId', 'firstName lastName email')
        .sort({ requested_at: 1 })
        .limit(limit);

    return payouts;
};

// Instance method: Mark as processing
PayoutRequestSchema.methods.markProcessing = async function () {
    if (this.status !== 'PENDING') {
        throw new Error('Can only mark pending requests as processing');
    }

    this.status = 'PROCESSING';
    this.processed_at = new Date();
    await this.save();

    return this;
};

// Instance method: Cancel request
PayoutRequestSchema.methods.cancel = async function () {
    if (this.status !== 'PENDING') {
        throw new Error('Can only cancel pending requests');
    }

    this.status = 'CANCELLED';
    this.processed_at = new Date();
    await this.save();

    return this;
};

const PayoutRequest = mongoose.model('PayoutRequest', PayoutRequestSchema);

export default PayoutRequest;

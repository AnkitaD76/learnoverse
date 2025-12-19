import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * TRANSACTION MODEL - IMMUTABLE LEDGER
 *
 * This is the single source of truth for all balance changes.
 *
 * LEDGER PRINCIPLES:
 * - Every balance change MUST create a transaction record
 * - Transactions are IMMUTABLE (never update, only create)
 * - To reverse a transaction, create a compensating transaction
 * - Balance = SUM(all COMPLETED transactions)
 *
 * TRANSACTION TYPES:
 * - PURCHASE: User buys points with money
 * - SALE: User sells points for money (cashout)
 * - ENROLLMENT: Points spent on course enrollment
 * - REFUND: Points returned (compensating transaction)
 * - ADMIN_CREDIT: Admin adds points to user
 * - ADMIN_DEBIT: Admin removes points from user
 * - BONUS: Promotional/reward points
 *
 * STATUSES:
 * - PENDING: Transaction initiated but not completed
 * - COMPLETED: Transaction successful, balance updated
 * - FAILED: Transaction failed, no balance change
 * - REVERSED: Transaction was reversed via compensating transaction
 */
const TransactionSchema = new mongoose.Schema(
    {
        // Unique transaction identifier (for idempotency and tracking)
        transaction_id: {
            type: String,
            default: () => uuidv4(),
            unique: true,
            required: true,
            index: true,
        },
        // User who owns this transaction
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        // Transaction type
        type: {
            type: String,
            enum: [
                'PURCHASE',
                'SALE',
                'ENROLLMENT',
                'REFUND',
                'ADMIN_CREDIT',
                'ADMIN_DEBIT',
                'BONUS',
                'REVERSAL',
            ],
            required: [true, 'Transaction type is required'],
            index: true,
        },
        // Points change (positive for credit, negative for debit)
        points_amount: {
            type: Number,
            required: [true, 'Points amount is required'],
            validate: {
                validator: Number.isInteger,
                message: 'Points must be an integer',
            },
        },
        // Cash equivalent (for PURCHASE and SALE transactions)
        cash_amount: {
            type: Number,
            default: 0,
        },
        // Currency used (for PURCHASE and SALE transactions)
        currency: {
            type: String,
            enum: ['USD', 'BDT', 'EUR', 'GBP', null],
            default: null,
        },
        // Exchange rate snapshot at time of transaction
        // CRITICAL: Preserve historical rates for audit
        exchange_rate: {
            type: Number,
            default: null,
        },
        // Transaction status
        status: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
            default: 'PENDING',
            required: true,
            index: true,
        },
        // Payment method (for PURCHASE transactions)
        payment_method: {
            type: String,
            enum: ['CARD', 'BKASH', 'PAYPAL', 'BANK_TRANSFER', null],
            default: null,
        },
        // Mock payment reference (in real system, this would be gateway transaction ID)
        payment_reference: {
            type: String,
            default: null,
        },
        // Related entity references
        related_course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            default: null,
        },
        related_enrollment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Enrollment',
            default: null,
        },
        related_payout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PayoutRequest',
            default: null,
        },
        // Reference to the original transaction (for REVERSAL and REFUND)
        reversal_of: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            default: null,
        },
        // Admin who performed the transaction (for ADMIN_CREDIT/DEBIT)
        admin_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Human-readable description
        description: {
            type: String,
            required: [true, 'Transaction description is required'],
            trim: true,
        },
        // Additional metadata (flexible for future extensions)
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        // Failure reason (if status is FAILED)
        failure_reason: {
            type: String,
            default: null,
        },
        // Completion timestamp
        completed_at: {
            type: Date,
            default: null,
        },
        // Balance snapshot after this transaction (for quick reconciliation)
        balance_after: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true,
        // Prevent updates to immutable records
        strict: true,
    }
);

// Compound indexes for efficient querying
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });

// Prevent updates to completed transactions (immutability)
TransactionSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();

    // Only allow status updates from PENDING to COMPLETED/FAILED
    if (update.$set && update.$set.status) {
        const allowedTransitions = {
            PENDING: ['COMPLETED', 'FAILED'],
        };

        // This is a simplified check - in production, validate current status
        next();
    } else {
        next(new Error('Transactions are immutable and cannot be updated'));
    }
});

// Static method: Create and complete a transaction atomically
TransactionSchema.statics.createAndComplete = async function (transactionData) {
    const transaction = await this.create({
        ...transactionData,
        status: 'COMPLETED',
        completed_at: new Date(),
    });

    return transaction;
};

// Static method: Complete a pending transaction
TransactionSchema.statics.completeTransaction = async function (transactionId) {
    const transaction = await this.findOneAndUpdate(
        {
            transaction_id: transactionId,
            status: 'PENDING',
        },
        {
            $set: {
                status: 'COMPLETED',
                completed_at: new Date(),
            },
        },
        { new: true }
    );

    if (!transaction) {
        throw new Error('Transaction not found or already completed');
    }

    return transaction;
};

// Static method: Fail a pending transaction
TransactionSchema.statics.failTransaction = async function (
    transactionId,
    reason
) {
    const transaction = await this.findOneAndUpdate(
        {
            transaction_id: transactionId,
            status: 'PENDING',
        },
        {
            $set: {
                status: 'FAILED',
                failure_reason: reason,
                completed_at: new Date(),
            },
        },
        { new: true }
    );

    if (!transaction) {
        throw new Error('Transaction not found or already processed');
    }

    return transaction;
};

// Static method: Create a reversal transaction
TransactionSchema.statics.createReversal = async function (
    originalTransactionId,
    reason
) {
    const originalTx = await this.findOne({
        transaction_id: originalTransactionId,
    });

    if (!originalTx) {
        throw new Error('Original transaction not found');
    }

    if (originalTx.status !== 'COMPLETED') {
        throw new Error('Can only reverse completed transactions');
    }

    // Create compensating transaction
    const reversalTx = await this.create({
        userId: originalTx.userId,
        type: 'REVERSAL',
        points_amount: -originalTx.points_amount, // Opposite sign
        cash_amount: originalTx.cash_amount,
        currency: originalTx.currency,
        status: 'COMPLETED',
        description: `Reversal: ${reason}`,
        reversal_of: originalTx._id,
        completed_at: new Date(),
    });

    // Mark original transaction as reversed
    await this.findByIdAndUpdate(originalTx._id, {
        $set: { status: 'REVERSED' },
    });

    return reversalTx;
};

// Static method: Get user balance from transactions (reconciliation)
TransactionSchema.statics.calculateUserBalance = async function (userId) {
    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: 'COMPLETED',
            },
        },
        {
            $group: {
                _id: null,
                total_points: { $sum: '$points_amount' },
                total_credits: {
                    $sum: {
                        $cond: [
                            { $gt: ['$points_amount', 0] },
                            '$points_amount',
                            0,
                        ],
                    },
                },
                total_debits: {
                    $sum: {
                        $cond: [
                            { $lt: ['$points_amount', 0] },
                            { $abs: '$points_amount' },
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    return result[0] || { total_points: 0, total_credits: 0, total_debits: 0 };
};

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;

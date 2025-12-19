import mongoose from 'mongoose';

/**
 * WALLET MODEL
 *
 * Represents a user's virtual wallet containing points and cash equivalent.
 *
 * CRITICAL RULES:
 * - Balances are DERIVED from transactions, not manually updated
 * - All balance mutations must go through the Transaction ledger
 * - points_balance = sum of all COMPLETED point transactions
 * - cash_equivalent_balance = sum of all COMPLETED cash transactions (mocked)
 *
 * FINANCIAL INTEGRITY:
 * - Use atomic operations for balance updates
 * - Always validate sufficient balance before debits
 * - Track reserved_points for pending transactions (escrow)
 */
const WalletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
            index: true,
        },
        // Total points available for spending
        points_balance: {
            type: Number,
            default: 0,
            min: [0, 'Points balance cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Points must be an integer',
            },
        },
        // Reserved points (in escrow for pending transactions)
        reserved_points: {
            type: Number,
            default: 0,
            min: [0, 'Reserved points cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Reserved points must be an integer',
            },
        },
        // Mock cash equivalent (for display purposes)
        // In a real system, this would track actual currency
        cash_equivalent_balance: {
            type: Number,
            default: 0,
            min: [0, 'Cash balance cannot be negative'],
        },
        // Default currency for display (user preference)
        default_currency: {
            type: String,
            enum: ['USD', 'BDT', 'EUR', 'GBP'],
            default: 'USD',
        },
        // Audit fields
        last_transaction_at: {
            type: Date,
        },
        total_points_earned: {
            type: Number,
            default: 0,
            min: 0,
        },
        total_points_spent: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual field: Available balance (total - reserved)
WalletSchema.virtual('available_balance').get(function () {
    return this.points_balance - this.reserved_points;
});

// Index for faster lookups
WalletSchema.index({ userId: 1 });

// Method: Check if user has sufficient balance
WalletSchema.methods.hasSufficientBalance = function (amount) {
    const available = this.points_balance - this.reserved_points;
    return available >= amount;
};

// Method: Reserve points for pending transactions
WalletSchema.methods.reservePoints = async function (amount) {
    if (!this.hasSufficientBalance(amount)) {
        throw new Error('Insufficient available balance');
    }

    this.reserved_points += amount;
    await this.save();
    return this;
};

// Method: Release reserved points
WalletSchema.methods.releaseReservedPoints = async function (amount) {
    this.reserved_points = Math.max(0, this.reserved_points - amount);
    await this.save();
    return this;
};

// Static method: Get or create wallet for user
WalletSchema.statics.getOrCreate = async function (userId) {
    let wallet = await this.findOne({ userId });

    if (!wallet) {
        wallet = await this.create({ userId });
    }

    return wallet;
};

// Static method: Credit points (atomic operation)
WalletSchema.statics.creditPoints = async function (
    userId,
    amount,
    releaseReserved = 0
) {
    const update = {
        $inc: {
            points_balance: amount,
            total_points_earned: amount > 0 ? amount : 0,
        },
        $set: {
            last_transaction_at: new Date(),
        },
    };

    if (releaseReserved > 0) {
        update.$inc.reserved_points = -releaseReserved;
    }

    const wallet = await this.findOneAndUpdate({ userId }, update, {
        new: true,
        upsert: true,
        runValidators: true,
    });

    return wallet;
};

// Static method: Debit points (atomic operation with validation)
WalletSchema.statics.debitPoints = async function (
    userId,
    amount,
    reserveFirst = false
) {
    const wallet = await this.findOne({ userId });

    if (!wallet) {
        throw new Error('Wallet not found');
    }

    if (!wallet.hasSufficientBalance(amount)) {
        throw new Error('Insufficient balance');
    }

    const update = {
        $inc: {
            points_balance: -amount,
            total_points_spent: amount,
        },
        $set: {
            last_transaction_at: new Date(),
        },
    };

    if (reserveFirst) {
        // Release from reserved pool
        update.$inc.reserved_points = -amount;
    }

    const updatedWallet = await this.findOneAndUpdate(
        {
            userId,
            points_balance: { $gte: amount },
        },
        update,
        { new: true, runValidators: true }
    );

    if (!updatedWallet) {
        throw new Error(
            'Failed to debit points - insufficient balance or wallet not found'
        );
    }

    return updatedWallet;
};

const Wallet = mongoose.model('Wallet', WalletSchema);

export default Wallet;

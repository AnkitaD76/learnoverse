import mongoose from 'mongoose';

/**
 * EXCHANGE RATE MODEL
 *
 * Manages currency to points conversion rates.
 *
 * VERSIONING STRATEGY:
 * - Rates are versioned, not updated
 * - Historical rates are preserved for audit
 * - Only one rate per currency can be active at a time
 * - When creating a new rate, previous one is automatically deactivated
 *
 * DESIGN PHILOSOPHY:
 * - Rates change over time
 * - We must preserve historical rates for transaction audit
 * - Users see current rates, but historical transactions keep their original rates
 *
 * EXAMPLE:
 * Currency: USD, Rate: 100 (1 USD = 100 points)
 * Currency: BDT, Rate: 1 (1 BDT = 1 point)
 * Currency: EUR, Rate: 110 (1 EUR = 110 points)
 */
const ExchangeRateSchema = new mongoose.Schema(
    {
        // Currency code
        currency: {
            type: String,
            enum: ['USD', 'BDT', 'EUR', 'GBP'],
            required: [true, 'Currency is required'],
            uppercase: true,
            index: true,
        },
        // Points per 1 unit of currency
        // Example: rate = 100 means 1 USD = 100 points
        rate: {
            type: Number,
            required: [true, 'Exchange rate is required'],
            min: [0.01, 'Rate must be greater than 0'],
        },
        // Whether this rate is currently active
        is_active: {
            type: Boolean,
            default: true,
            index: true,
        },
        // When this rate becomes effective
        effective_from: {
            type: Date,
            default: Date.now,
            required: true,
        },
        // When this rate expires (null if still active)
        effective_until: {
            type: Date,
            default: null,
        },
        // Admin who created/updated this rate
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        // Reason for rate change (audit trail)
        change_reason: {
            type: String,
            trim: true,
            default: 'Initial rate',
        },
        // Additional metadata
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient querying
ExchangeRateSchema.index({ currency: 1, effective_from: -1 });

// Ensure only one active rate per currency
ExchangeRateSchema.index(
    { currency: 1, is_active: 1 },
    {
        unique: true,
        partialFilterExpression: { is_active: true },
    }
);

// Pre-save hook: Deactivate previous rates when creating a new one
ExchangeRateSchema.pre('save', async function (next) {
    if (this.isNew && this.is_active) {
        // Deactivate all previous active rates for this currency
        await this.constructor.updateMany(
            {
                currency: this.currency,
                is_active: true,
                _id: { $ne: this._id },
            },
            {
                $set: {
                    is_active: false,
                    effective_until: new Date(),
                },
            }
        );
    }
    next();
});

// Static method: Get current active rate for a currency
ExchangeRateSchema.statics.getCurrentRate = async function (currency) {
    const rate = await this.findOne({
        currency: currency.toUpperCase(),
        is_active: true,
    });

    if (!rate) {
        throw new Error(`No active exchange rate found for ${currency}`);
    }

    return rate;
};

// Static method: Get all active rates
ExchangeRateSchema.statics.getAllActiveRates = async function () {
    const rates = await this.find({ is_active: true }).sort({ currency: 1 });
    return rates;
};

// Static method: Calculate points from cash amount
ExchangeRateSchema.statics.calculatePoints = async function (
    currency,
    cashAmount
) {
    const rate = await this.getCurrentRate(currency);
    const points = Math.floor(cashAmount * rate.rate);

    return {
        points,
        rate: rate.rate,
        currency: rate.currency,
        rateId: rate._id,
    };
};

// Static method: Calculate cash from points amount
ExchangeRateSchema.statics.calculateCash = async function (
    currency,
    pointsAmount
) {
    const rate = await this.getCurrentRate(currency);
    const cash = pointsAmount / rate.rate;

    return {
        cash: parseFloat(cash.toFixed(2)),
        rate: rate.rate,
        currency: rate.currency,
        rateId: rate._id,
    };
};

// Static method: Set new rate (creates new version)
ExchangeRateSchema.statics.setNewRate = async function (
    currency,
    newRate,
    createdBy,
    reason
) {
    const exchangeRate = await this.create({
        currency: currency.toUpperCase(),
        rate: newRate,
        is_active: true,
        effective_from: new Date(),
        created_by: createdBy,
        change_reason: reason || 'Rate update',
    });

    return exchangeRate;
};

// Instance method: Deactivate this rate
ExchangeRateSchema.methods.deactivate = async function () {
    this.is_active = false;
    this.effective_until = new Date();
    await this.save();
    return this;
};

const ExchangeRate = mongoose.model('ExchangeRate', ExchangeRateSchema);

export default ExchangeRate;

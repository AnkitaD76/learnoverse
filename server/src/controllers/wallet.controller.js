import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js';
import {
    Wallet,
    Transaction,
    ExchangeRate,
    PayoutRequest,
} from '../models/index.js';

/**
 * WALLET CONTROLLER
 *
 * Handles all wallet-related operations:
 * - Buy points (mock payment)
 * - Sell points (mock payout)
 * - Get wallet balance
 * - Get transaction history
 *
 * FINANCIAL RULES ENFORCED:
 * - All balance changes go through transactions
 * - Atomic operations prevent race conditions
 * - Idempotency for payment operations
 * - Proper error handling with rollback
 */

/**
 * GET WALLET BALANCE
 *
 * Returns user's current wallet state including:
 * - Points balance
 * - Available balance (excluding reserved)
 * - Cash equivalent
 * - Recent transactions summary
 */
const getWalletBalance = async (req, res) => {
    const { userId } = req.user;

    // Get or create wallet
    const wallet = await Wallet.getOrCreate(userId);

    // Verify balance integrity (reconciliation check)
    const calculatedBalance = await Transaction.calculateUserBalance(userId);

    // If there's a discrepancy, log it (in production, alert admins)
    if (Math.abs(wallet.points_balance - calculatedBalance.total_points) > 0) {
        console.warn(
            `Balance mismatch for user ${userId}: Wallet=${wallet.points_balance}, Calculated=${calculatedBalance.total_points}`
        );
        // TODO: In production, trigger reconciliation process
    }

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({
        userId,
        status: 'COMPLETED',
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type points_amount description createdAt');

    res.status(StatusCodes.OK).json({
        wallet: {
            points_balance: wallet.points_balance,
            reserved_points: wallet.reserved_points,
            available_balance: wallet.available_balance,
            cash_equivalent_balance: wallet.cash_equivalent_balance,
            default_currency: wallet.default_currency,
            total_points_earned: wallet.total_points_earned,
            total_points_spent: wallet.total_points_spent,
            last_transaction_at: wallet.last_transaction_at,
        },
        recent_transactions: recentTransactions,
        calculated_balance: calculatedBalance,
    });
};

/**
 * GET TRANSACTION HISTORY
 *
 * Returns paginated transaction history with filters
 */
const getTransactionHistory = async (req, res) => {
    const { userId } = req.user;
    const {
        page = 1,
        limit = 20,
        type,
        status,
        startDate,
        endDate,
    } = req.query;

    // Build filter
    const filter = { userId };

    if (type) {
        filter.type = type;
    }

    if (status) {
        filter.status = status;
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.$lte = new Date(endDate);
        }
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('related_course', 'title')
            .populate('admin_user', 'firstName lastName'),
        Transaction.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({
        transactions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    });
};

/**
 * GET EXCHANGE RATES
 *
 * Returns current active exchange rates for all currencies
 */
const getExchangeRates = async (req, res) => {
    const rates = await ExchangeRate.getAllActiveRates();

    const formattedRates = rates.map(rate => ({
        currency: rate.currency,
        rate: rate.rate,
        effective_from: rate.effective_from,
        description: `1 ${rate.currency} = ${rate.rate} points`,
    }));

    res.status(StatusCodes.OK).json({
        exchange_rates: formattedRates,
    });
};

/**
 * BUY POINTS - MOCK PAYMENT FLOW
 *
 * Simulates a payment gateway integration.
 *
 * FLOW:
 * 1. Validate input
 * 2. Calculate points using current exchange rate
 * 3. Create PENDING transaction
 * 4. Simulate payment processing (mock)
 * 5. Update transaction to COMPLETED
 * 6. Credit points to wallet
 *
 * TODO: Replace mock payment with real gateway:
 * - Stripe: stripe.paymentIntents.create()
 * - bKash: bKash API integration
 * - PayPal: PayPal SDK
 */
const buyPoints = async (req, res) => {
    const { userId } = req.user;
    const {
        amount, // Cash amount
        currency,
        payment_method,
        payment_details, // Card/account details (mock)
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
        throw new BadRequestError('Invalid amount');
    }

    if (!currency) {
        throw new BadRequestError('Currency is required');
    }

    if (!payment_method) {
        throw new BadRequestError('Payment method is required');
    }

    const validPaymentMethods = ['CARD', 'BKASH', 'PAYPAL', 'BANK_TRANSFER'];
    if (!validPaymentMethods.includes(payment_method)) {
        throw new BadRequestError('Invalid payment method');
    }

    // Start session for transaction atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get current exchange rate
        const rateInfo = await ExchangeRate.calculatePoints(currency, amount);

        if (rateInfo.points < 1) {
            throw new BadRequestError(
                'Amount too small - minimum 1 point required'
            );
        }

        // Create PENDING transaction
        const transaction = await Transaction.create(
            [
                {
                    userId,
                    type: 'PURCHASE',
                    points_amount: rateInfo.points,
                    cash_amount: amount,
                    currency: rateInfo.currency,
                    exchange_rate: rateInfo.rate,
                    status: 'PENDING',
                    payment_method,
                    description: `Purchase ${rateInfo.points} points for ${amount} ${currency}`,
                    metadata: {
                        payment_details: payment_details || {},
                    },
                },
            ],
            { session }
        );

        // MOCK PAYMENT PROCESSING
        // In real system, call payment gateway here
        // const paymentResult = await paymentGateway.charge({...});

        const mockPaymentSuccess =
            await simulatePaymentProcessing(payment_method);

        if (!mockPaymentSuccess.success) {
            // Payment failed
            await Transaction.findByIdAndUpdate(
                transaction[0]._id,
                {
                    $set: {
                        status: 'FAILED',
                        failure_reason: mockPaymentSuccess.reason,
                        completed_at: new Date(),
                    },
                },
                { session }
            );

            await session.commitTransaction();

            throw new BadRequestError(
                `Payment failed: ${mockPaymentSuccess.reason}`
            );
        }

        // Payment successful - update transaction
        await Transaction.findByIdAndUpdate(
            transaction[0]._id,
            {
                $set: {
                    status: 'COMPLETED',
                    payment_reference: mockPaymentSuccess.reference,
                    completed_at: new Date(),
                },
            },
            { session }
        );

        // Credit points to wallet (atomic)
        const wallet = await Wallet.creditPoints(userId, rateInfo.points);

        await session.commitTransaction();

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Points purchased successfully',
            transaction: {
                id: transaction[0]._id,
                transaction_id: transaction[0].transaction_id,
                points_purchased: rateInfo.points,
                amount_paid: amount,
                currency,
                exchange_rate: rateInfo.rate,
                payment_reference: mockPaymentSuccess.reference,
            },
            wallet: {
                points_balance: wallet.points_balance,
                available_balance: wallet.available_balance,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * SELL POINTS - MOCK PAYOUT FLOW
 *
 * Allows users to convert points back to cash.
 *
 * FLOW:
 * 1. Validate sufficient balance
 * 2. Calculate cash equivalent
 * 3. Create SALE transaction (debits points immediately)
 * 4. Create payout request
 * 5. Simulate payout processing
 * 6. If failed, create reversal transaction
 *
 * ESCROW LOGIC:
 * - Points are debited immediately (escrowed)
 * - If payout fails, points are restored via compensating transaction
 * - This prevents double-spending while payout is processing
 */
const sellPoints = async (req, res) => {
    const { userId } = req.user;
    const {
        points, // Points to sell
        currency,
        payout_method,
        payout_details, // Bank account, bKash number, etc.
    } = req.body;

    // Validation
    if (!points || points <= 0) {
        throw new BadRequestError('Invalid points amount');
    }

    if (!Number.isInteger(points)) {
        throw new BadRequestError('Points must be an integer');
    }

    if (!currency) {
        throw new BadRequestError('Currency is required');
    }

    if (!payout_method) {
        throw new BadRequestError('Payout method is required');
    }

    const validPayoutMethods = ['BANK_TRANSFER', 'BKASH', 'PAYPAL', 'CARD'];
    if (!validPayoutMethods.includes(payout_method)) {
        throw new BadRequestError('Invalid payout method');
    }

    // Minimum payout check (prevent tiny payouts)
    const MIN_PAYOUT_POINTS = 100;
    if (points < MIN_PAYOUT_POINTS) {
        throw new BadRequestError(
            `Minimum payout is ${MIN_PAYOUT_POINTS} points`
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check balance
        const wallet = await Wallet.findOne({ userId }).session(session);
        if (!wallet || !wallet.hasSufficientBalance(points)) {
            throw new BadRequestError('Insufficient points balance');
        }

        // Calculate cash equivalent
        const cashInfo = await ExchangeRate.calculateCash(currency, points);

        // Create SALE transaction (debits points immediately - ESCROW)
        const transaction = await Transaction.create(
            [
                {
                    userId,
                    type: 'SALE',
                    points_amount: -points, // Negative = debit
                    cash_amount: cashInfo.cash,
                    currency: cashInfo.currency,
                    exchange_rate: cashInfo.rate,
                    status: 'COMPLETED', // Points debited immediately
                    description: `Sell ${points} points for ${cashInfo.cash} ${currency}`,
                    completed_at: new Date(),
                },
            ],
            { session }
        );

        // Debit points from wallet
        await Wallet.debitPoints(userId, points);

        // Create payout request
        const payoutRequest = await PayoutRequest.createRequest(
            userId,
            points,
            cashInfo.cash,
            currency,
            cashInfo.rate,
            payout_method,
            payout_details,
            transaction[0]._id
        );

        await session.commitTransaction();

        // Simulate payout processing (async in real system)
        // In production, this would be handled by a background job
        simulatePayoutProcessing(payoutRequest._id);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Payout request created successfully',
            payout: {
                id: payoutRequest._id,
                points_sold: points,
                cash_amount: cashInfo.cash,
                currency,
                exchange_rate: cashInfo.rate,
                payout_method,
                status: payoutRequest.status,
                estimated_processing_time: '1-3 business days', // Mock
            },
            wallet: {
                points_balance: wallet.points_balance - points,
                available_balance: wallet.available_balance - points,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * GET PAYOUT REQUESTS
 *
 * Returns user's payout history
 */
const getPayoutRequests = async (req, res) => {
    const { userId } = req.user;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { userId };
    if (status) {
        filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
        PayoutRequest.find(filter)
            .sort({ requested_at: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        PayoutRequest.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({
        payouts,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    });
};

/**
 * MOCK PAYMENT SIMULATION
 *
 * Simulates payment gateway response.
 * In production, replace with actual gateway integration.
 *
 * SUCCESS RATE: 90% (to simulate real-world failures)
 */
const simulatePaymentProcessing = async paymentMethod => {
    return new Promise(resolve => {
        setTimeout(() => {
            // 90% success rate
            const success = Math.random() > 0.1;

            if (success) {
                resolve({
                    success: true,
                    reference: `MOCK_${paymentMethod}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                });
            } else {
                const reasons = [
                    'Insufficient funds',
                    'Card declined',
                    'Payment gateway timeout',
                    'Invalid card details',
                ];
                resolve({
                    success: false,
                    reason: reasons[Math.floor(Math.random() * reasons.length)],
                });
            }
        }, 1000); // Simulate network delay
    });
};

/**
 * MOCK PAYOUT SIMULATION
 *
 * Simulates payout processing (runs async).
 * In production, this would be a background job.
 */
const simulatePayoutProcessing = async payoutRequestId => {
    // Simulate processing delay (2-5 seconds)
    const delay = 2000 + Math.random() * 3000;

    setTimeout(async () => {
        try {
            // 95% success rate for payouts
            const success = Math.random() > 0.05;

            if (success) {
                await PayoutRequest.processPayout(payoutRequestId, true);
                console.log(`Payout ${payoutRequestId} completed successfully`);
            } else {
                // Payout failed - need to restore points
                const failureReason = 'Bank account invalid';
                const payout = await PayoutRequest.processPayout(
                    payoutRequestId,
                    false,
                    failureReason
                );

                // Create reversal transaction to restore points
                await Transaction.create({
                    userId: payout.userId,
                    type: 'REFUND',
                    points_amount: payout.points_amount, // Positive = credit
                    cash_amount: payout.cash_amount,
                    currency: payout.currency,
                    status: 'COMPLETED',
                    description: `Refund for failed payout: ${failureReason}`,
                    related_payout: payout._id,
                    completed_at: new Date(),
                });

                // Restore points to wallet
                await Wallet.creditPoints(payout.userId, payout.points_amount);

                console.log(`Payout ${payoutRequestId} failed and refunded`);
            }
        } catch (error) {
            console.error('Error processing payout:', error);
        }
    }, delay);
};

export {
    getWalletBalance,
    getTransactionHistory,
    getExchangeRates,
    buyPoints,
    sellPoints,
    getPayoutRequests,
};

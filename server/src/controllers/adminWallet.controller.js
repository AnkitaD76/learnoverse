import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '../errors/index.js';
import {
    Wallet,
    Transaction,
    ExchangeRate,
    PayoutRequest,
} from '../models/index.js';

/**
 * ADMIN WALLET CONTROLLER
 *
 * Admin-only operations for managing the wallet system:
 * - Set/update exchange rates
 * - Manual balance adjustments (with audit trail)
 * - View pending payouts
 * - Process/approve payouts
 * - System-wide wallet statistics
 *
 * SECURITY:
 * - All endpoints require admin role
 * - All actions are logged with admin user ID
 * - Balance changes create immutable transaction records
 */

/**
 * POST /api/v1/admin/wallet/exchange-rates
 *
 * Create or update exchange rate for a currency.
 * Old rates are preserved for audit trail.
 */
const setExchangeRate = async (req, res) => {
    const { userId } = req.user;
    const { currency, rate, reason } = req.body;

    if (!currency) {
        throw new BadRequestError('Currency is required');
    }

    if (!rate || rate <= 0) {
        throw new BadRequestError('Rate must be greater than 0');
    }

    const validCurrencies = ['USD', 'BDT', 'EUR', 'GBP'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
        throw new BadRequestError(
            `Invalid currency. Supported: ${validCurrencies.join(', ')}`
        );
    }

    // Create new rate (automatically deactivates old ones)
    const exchangeRate = await ExchangeRate.setNewRate(
        currency,
        rate,
        userId,
        reason || 'Admin rate update'
    );

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Exchange rate updated successfully',
        exchange_rate: {
            currency: exchangeRate.currency,
            rate: exchangeRate.rate,
            effective_from: exchangeRate.effective_from,
            created_by: userId,
            change_reason: exchangeRate.change_reason,
        },
    });
};

/**
 * GET /api/v1/admin/wallet/exchange-rates/history
 *
 * Get historical exchange rates (for audit)
 */
const getExchangeRateHistory = async (req, res) => {
    const { currency, limit = 50 } = req.query;

    const filter = {};
    if (currency) {
        filter.currency = currency.toUpperCase();
    }

    const rates = await ExchangeRate.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('created_by', 'firstName lastName email');

    res.status(StatusCodes.OK).json({
        success: true,
        count: rates.length,
        rates,
    });
};

/**
 * POST /api/v1/admin/wallet/adjust-balance
 *
 * Manually adjust user's points balance.
 *
 * USE CASES:
 * - Compensation for system errors
 * - Promotional bonuses
 * - Correcting incorrect charges
 * - Manual refunds
 *
 * AUDIT TRAIL:
 * - Creates ADMIN_CREDIT or ADMIN_DEBIT transaction
 * - Records admin user who made the change
 * - Requires reason for the adjustment
 */
const adjustUserBalance = async (req, res) => {
    const adminId = req.user.userId;
    const { targetUserId, points, reason, type } = req.body;

    // Validation
    if (!targetUserId) {
        throw new BadRequestError('Target user ID is required');
    }

    if (!points || points === 0) {
        throw new BadRequestError('Points amount must be non-zero');
    }

    if (!Number.isInteger(points)) {
        throw new BadRequestError('Points must be an integer');
    }

    if (!reason || reason.trim().length < 10) {
        throw new BadRequestError(
            'Detailed reason is required (minimum 10 characters)'
        );
    }

    if (!type || !['CREDIT', 'DEBIT'].includes(type)) {
        throw new BadRequestError('Type must be CREDIT or DEBIT');
    }

    // Validate target user exists (via wallet)
    const wallet = await Wallet.getOrCreate(targetUserId);

    // For debits, ensure sufficient balance
    if (type === 'DEBIT' && !wallet.hasSufficientBalance(Math.abs(points))) {
        throw new BadRequestError(
            'User has insufficient balance for this debit'
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Determine transaction type and points amount
        const transactionType =
            type === 'CREDIT' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT';
        const pointsAmount =
            type === 'CREDIT' ? Math.abs(points) : -Math.abs(points);

        // Create transaction
        const transaction = await Transaction.create(
            [
                {
                    userId: targetUserId,
                    type: transactionType,
                    points_amount: pointsAmount,
                    status: 'COMPLETED',
                    description: `Admin ${type.toLowerCase()}: ${reason}`,
                    admin_user: adminId,
                    completed_at: new Date(),
                    metadata: {
                        admin_action: true,
                        adjustment_reason: reason,
                    },
                },
            ],
            { session }
        );

        // Update wallet
        if (type === 'CREDIT') {
            await Wallet.creditPoints(targetUserId, Math.abs(points));
        } else {
            await Wallet.debitPoints(targetUserId, Math.abs(points));
        }

        await session.commitTransaction();

        // Get updated wallet
        const updatedWallet = await Wallet.findOne({ userId: targetUserId });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: `Successfully ${type.toLowerCase()}ed ${Math.abs(points)} points`,
            transaction: {
                id: transaction[0]._id,
                transaction_id: transaction[0].transaction_id,
                type: transactionType,
                points_amount: pointsAmount,
                reason,
            },
            wallet: {
                user_id: targetUserId,
                new_balance: updatedWallet.points_balance,
                available_balance: updatedWallet.available_balance,
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
 * GET /api/v1/admin/wallet/pending-payouts
 *
 * Get all pending payout requests for admin review
 */
const getPendingPayouts = async (req, res) => {
    const { limit = 50 } = req.query;

    const payouts = await PayoutRequest.getPendingPayouts(parseInt(limit));

    res.status(StatusCodes.OK).json({
        success: true,
        count: payouts.length,
        payouts,
    });
};

/**
 * POST /api/v1/admin/wallet/payouts/:id/process
 *
 * Manually process a payout request (approve or reject)
 */
const processPayout = async (req, res) => {
    const adminId = req.user.userId;
    const payoutId = req.params.id;
    const { action, reason } = req.body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
        throw new BadRequestError('Action must be APPROVE or REJECT');
    }

    const payout = await PayoutRequest.findById(payoutId);

    if (!payout) {
        throw new NotFoundError('Payout request not found');
    }

    if (payout.status !== 'PENDING' && payout.status !== 'PROCESSING') {
        throw new BadRequestError('Can only process pending payouts');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (action === 'APPROVE') {
            // Mark payout as completed
            payout.status = 'COMPLETED';
            payout.processed_at = new Date();
            payout.completed_at = new Date();
            payout.processed_by = adminId;
            payout.admin_notes = reason || 'Manually approved by admin';
            payout.payment_reference = `ADMIN_APPROVED_${Date.now()}`;
            await payout.save({ session });

            await session.commitTransaction();

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Payout approved successfully',
                payout: {
                    id: payout._id,
                    status: payout.status,
                    points_amount: payout.points_amount,
                    cash_amount: payout.cash_amount,
                    currency: payout.currency,
                },
            });
        } else {
            // REJECT - need to refund points
            payout.status = 'FAILED';
            payout.processed_at = new Date();
            payout.processed_by = adminId;
            payout.failure_reason = reason || 'Rejected by admin';
            payout.admin_notes = reason || 'Manually rejected by admin';
            await payout.save({ session });

            // Create refund transaction
            const transaction = await Transaction.create(
                [
                    {
                        userId: payout.userId,
                        type: 'REFUND',
                        points_amount: payout.points_amount, // Positive = credit back
                        cash_amount: payout.cash_amount,
                        currency: payout.currency,
                        status: 'COMPLETED',
                        description: `Refund for rejected payout: ${reason || 'Admin rejection'}`,
                        related_payout: payout._id,
                        admin_user: adminId,
                        completed_at: new Date(),
                    },
                ],
                { session }
            );

            // Credit points back to user
            await Wallet.creditPoints(payout.userId, payout.points_amount);

            await session.commitTransaction();

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Payout rejected and points refunded',
                payout: {
                    id: payout._id,
                    status: payout.status,
                    points_refunded: payout.points_amount,
                },
                refund_transaction: {
                    id: transaction[0]._id,
                    transaction_id: transaction[0].transaction_id,
                },
            });
        }
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * GET /api/v1/admin/wallet/statistics
 *
 * Get system-wide wallet statistics
 */
const getWalletStatistics = async (req, res) => {
    const [
        totalWallets,
        totalPointsInCirculation,
        transactionStats,
        payoutStats,
    ] = await Promise.all([
        // Total number of wallets
        Wallet.countDocuments(),

        // Total points in all wallets
        Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    total_points: { $sum: '$points_balance' },
                    total_reserved: { $sum: '$reserved_points' },
                    total_earned: { $sum: '$total_points_earned' },
                    total_spent: { $sum: '$total_points_spent' },
                },
            },
        ]),

        // Transaction statistics
        Transaction.aggregate([
            {
                $match: { status: 'COMPLETED' },
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    total_points: { $sum: '$points_amount' },
                },
            },
        ]),

        // Payout statistics
        PayoutRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    total_points: { $sum: '$points_amount' },
                    total_cash: { $sum: '$cash_amount' },
                },
            },
        ]),
    ]);

    res.status(StatusCodes.OK).json({
        success: true,
        statistics: {
            wallets: {
                total_count: totalWallets,
                points_in_circulation: totalPointsInCirculation[0] || {},
            },
            transactions: transactionStats,
            payouts: payoutStats,
        },
    });
};

/**
 * GET /api/v1/admin/wallet/users/:userId/details
 *
 * Get detailed wallet information for a specific user (admin view)
 */
const getUserWalletDetails = async (req, res) => {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        throw new NotFoundError('Wallet not found for this user');
    }

    // Get recent transactions
    const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('admin_user', 'firstName lastName email');

    // Get pending payouts
    const pendingPayouts = await PayoutRequest.find({
        userId,
        status: { $in: ['PENDING', 'PROCESSING'] },
    });

    // Calculate balance from transactions (reconciliation)
    const calculatedBalance = await Transaction.calculateUserBalance(userId);

    res.status(StatusCodes.OK).json({
        success: true,
        wallet,
        calculated_balance: calculatedBalance,
        balance_match: wallet.points_balance === calculatedBalance.total_points,
        recent_transactions: transactions,
        pending_payouts: pendingPayouts,
    });
};

export {
    setExchangeRate,
    getExchangeRateHistory,
    adjustUserBalance,
    getPendingPayouts,
    processPayout,
    getWalletStatistics,
    getUserWalletDetails,
};

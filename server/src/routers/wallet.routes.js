import express from 'express';
import {
    getWalletBalance,
    getTransactionHistory,
    getExchangeRates,
    buyPoints,
    sellPoints,
    getPayoutRequests,
} from '../controllers/wallet.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * WALLET ROUTES
 *
 * All routes require authentication.
 *
 * ENDPOINTS:
 * - GET /api/v1/wallet/balance - Get wallet balance
 * - GET /api/v1/wallet/transactions - Get transaction history
 * - GET /api/v1/wallet/exchange-rates - Get current exchange rates
 * - POST /api/v1/wallet/buy-points - Buy points (mock payment)
 * - POST /api/v1/wallet/sell-points - Sell points (mock payout)
 * - GET /api/v1/wallet/payouts - Get payout requests
 */

// All wallet routes require authentication
router.use(authenticate);

// Get wallet balance and summary
router.get('/balance', getWalletBalance);

// Get transaction history with filters and pagination
router.get('/transactions', getTransactionHistory);

// Get current exchange rates
router.get('/exchange-rates', getExchangeRates);

// Buy points (mock payment)
router.post('/buy-points', buyPoints);

// Sell points (mock payout)
router.post('/sell-points', sellPoints);

// Get payout requests
router.get('/payouts', getPayoutRequests);

export default router;

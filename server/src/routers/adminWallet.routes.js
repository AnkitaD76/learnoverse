import express from 'express';
import {
    setExchangeRate,
    getExchangeRateHistory,
    adjustUserBalance,
    getPendingPayouts,
    processPayout,
    getWalletStatistics,
    getUserWalletDetails,
} from '../controllers/adminWallet.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorization.js';

const router = express.Router();
 
/**
 * ADMIN WALLET ROUTES
 * 
 * All routes require:
 * 1. Authentication
 * 2. Admin role
 *
 * ENDPOINTS:
 * - POST /api/v1/admin/wallet/exchange-rates - Set/update exchange rate
 * - GET /api/v1/admin/wallet/exchange-rates/history - View rate history
 * - POST /api/v1/admin/wallet/adjust-balance - Manually adjust user balance
 * - GET /api/v1/admin/wallet/pending-payouts - View pending payouts
 * - POST /api/v1/admin/wallet/payouts/:id/process - Approve/reject payout
 * - GET /api/v1/admin/wallet/statistics - System-wide statistics
 * - GET /api/v1/admin/wallet/users/:userId/details - User wallet details
 */

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Exchange rate management
router.post('/exchange-rates', setExchangeRate);
router.get('/exchange-rates/history', getExchangeRateHistory);

// Manual balance adjustments
router.post('/adjust-balance', adjustUserBalance);

// Payout management
router.get('/pending-payouts', getPendingPayouts);
router.post('/payouts/:id/process', processPayout);

// Statistics and monitoring
router.get('/statistics', getWalletStatistics);

// User wallet details (admin view)
router.get('/users/:userId/details', getUserWalletDetails);

export default router;

import apiClient from './client';

/**
 * WALLET API SERVICE
 *
 * Handles all wallet-related API calls.
 *
 * PRINCIPLES:
 * - Never cache balance locally
 * - Always get fresh data from backend
 * - Handle errors at service level
 * - Return consistent data structures
 */

/**
 * Get user's wallet balance and summary
 */
export const getWalletBalance = async () => {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
};

/**
 * Get transaction history with pagination and filters
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.type - Filter by transaction type
 * @param {string} params.status - Filter by status
 * @param {string} params.startDate - Filter from date
 * @param {string} params.endDate - Filter to date
 */
export const getTransactionHistory = async (params = {}) => {
    const response = await apiClient.get('/wallet/transactions', { params });
    return response.data;
};

/**
 * Get current exchange rates for all currencies
 */
export const getExchangeRates = async () => {
    const response = await apiClient.get('/wallet/exchange-rates');
    return response.data;
};

/**
 * Buy points with mock payment
 *
 * @param {Object} data - Purchase data
 * @param {number} data.amount - Cash amount
 * @param {string} data.currency - Currency code (USD, BDT, EUR, GBP)
 * @param {string} data.payment_method - Payment method (CARD, BKASH, PAYPAL, BANK_TRANSFER)
 * @param {Object} data.payment_details - Payment details (mock)
 */
export const buyPoints = async data => {
    const response = await apiClient.post('/wallet/buy-points', data);
    return response.data;
};

/**
 * Sell points for cash (request payout)
 *
 * @param {Object} data - Payout data
 * @param {number} data.points - Points to sell
 * @param {string} data.currency - Currency code
 * @param {string} data.payout_method - Payout method
 * @param {Object} data.payout_details - Payout account details
 */
export const sellPoints = async data => {
    const response = await apiClient.post('/wallet/sell-points', data);
    return response.data;
};

/**
 * Get payout request history
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status
 */
export const getPayoutRequests = async (params = {}) => {
    const response = await apiClient.get('/wallet/payouts', { params });
    return response.data;
};

/**
 * Calculate points for a given cash amount
 *
 * This is a client-side helper that uses exchange rates
 * to calculate points before making a purchase.
 *
 * @param {number} cashAmount - Amount in currency
 * @param {string} currency - Currency code
 * @param {Array} exchangeRates - List of exchange rates
 * @returns {number} - Calculated points
 */
export const calculatePoints = (cashAmount, currency, exchangeRates) => {
    const rate = exchangeRates.find(r => r.currency === currency);
    if (!rate) return 0;
    return Math.floor(cashAmount * rate.rate);
};

/**
 * Calculate cash for a given points amount
 *
 * @param {number} points - Points amount
 * @param {string} currency - Currency code
 * @param {Array} exchangeRates - List of exchange rates
 * @returns {number} - Calculated cash amount
 */
export const calculateCash = (points, currency, exchangeRates) => {
    const rate = exchangeRates.find(r => r.currency === currency);
    if (!rate) return 0;
    return parseFloat((points / rate.rate).toFixed(2));
};

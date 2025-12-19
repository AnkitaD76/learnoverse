import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { useSession } from './SessionContext';
import * as walletApi from '../api/wallet';

/**
 * WALLET CONTEXT
 *
 * Centralized state management for wallet operations.
 *
 * PRINCIPLES:
 * - Single source of truth for wallet data
 * - Always fetch from backend (no local optimistic updates)
 * - Provide loading and error states
 * - Refresh wallet after any mutation
 * - Handle race conditions gracefully
 *
 * STATE:
 * - wallet: Current wallet balance and metadata
 * - exchangeRates: Current currency exchange rates
 * - recentTransactions: Last few transactions (summary)
 * - isLoading: Loading state
 * - error: Error message
 *
 * METHODS:
 * - refreshWallet: Fetch latest wallet data
 * - buyPoints: Purchase points
 * - sellPoints: Request payout
 * - clearError: Clear error state
 */

const WalletContext = createContext(null);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const { isAuthenticated } = useSession();

    // Wallet state
    const [wallet, setWallet] = useState(null);
    const [exchangeRates, setExchangeRates] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pending operation tracking (prevent double submit)
    const [pendingOperation, setPendingOperation] = useState(null);

    /**
     * Fetch wallet balance and summary
     *
     * CRITICAL: This is the ONLY way to update wallet state.
     * Never update wallet.points_balance directly.
     */
    const refreshWallet = useCallback(async () => {
        if (!isAuthenticated) {
            setWallet(null);
            setRecentTransactions([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const data = await walletApi.getWalletBalance();

            setWallet(data.wallet);
            setRecentTransactions(data.recent_transactions || []);
        } catch (err) {
            console.error('Failed to fetch wallet:', err);
            setError(
                err.response?.data?.message || 'Failed to load wallet data'
            );

            // If 404, user doesn't have a wallet yet (will be created on first transaction)
            if (err.response?.status === 404) {
                setWallet({
                    points_balance: 0,
                    reserved_points: 0,
                    available_balance: 0,
                    cash_equivalent_balance: 0,
                    default_currency: 'USD',
                    total_points_earned: 0,
                    total_points_spent: 0,
                });
                setError(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * Fetch exchange rates
     *
     * Rates are fetched separately since they change less frequently.
     */
    const refreshExchangeRates = useCallback(async () => {
        if (!isAuthenticated) {
            setExchangeRates([]);
            return;
        }

        try {
            const data = await walletApi.getExchangeRates();
            setExchangeRates(data.exchange_rates || []);
        } catch (err) {
            console.error('Failed to fetch exchange rates:', err);
            // Don't show error to user for rates, use defaults
            setExchangeRates([
                {
                    currency: 'USD',
                    rate: 100,
                    description: '1 USD = 100 points',
                },
                { currency: 'BDT', rate: 1, description: '1 BDT = 1 point' },
                {
                    currency: 'EUR',
                    rate: 110,
                    description: '1 EUR = 110 points',
                },
                {
                    currency: 'GBP',
                    rate: 125,
                    description: '1 GBP = 125 points',
                },
            ]);
        }
    }, [isAuthenticated]);

    /**
     * Initialize wallet data on mount and when auth changes
     */
    useEffect(() => {
        if (isAuthenticated) {
            refreshWallet();
            refreshExchangeRates();
        } else {
            // Clear wallet state when logged out
            setWallet(null);
            setExchangeRates([]);
            setRecentTransactions([]);
        }
    }, [isAuthenticated, refreshWallet, refreshExchangeRates]);

    /**
     * Buy points
     *
     * FLOW:
     * 1. Validate no pending operation
     * 2. Set pending operation
     * 3. Call API
     * 4. Refresh wallet on success
     * 5. Clear pending operation
     *
     * @returns {Object} - { success: boolean, data?: object, error?: string }
     */
    const buyPoints = async purchaseData => {
        // Prevent double submit
        if (pendingOperation) {
            return {
                success: false,
                error: 'Another operation is in progress',
            };
        }

        try {
            setPendingOperation('buy');
            setError(null);

            const data = await walletApi.buyPoints(purchaseData);

            // Refresh wallet to get updated balance
            await refreshWallet();

            return {
                success: true,
                data,
            };
        } catch (err) {
            console.error('Buy points failed:', err);
            const errorMessage =
                err.response?.data?.message || 'Failed to purchase points';
            setError(errorMessage);

            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            setPendingOperation(null);
        }
    };

    /**
     * Sell points
     *
     * FLOW:
     * 1. Validate no pending operation
     * 2. Set pending operation
     * 3. Call API (points debited immediately on backend)
     * 4. Refresh wallet on success (shows reduced balance)
     * 5. Clear pending operation
     *
     * @returns {Object} - { success: boolean, data?: object, error?: string }
     */
    const sellPoints = async payoutData => {
        // Prevent double submit
        if (pendingOperation) {
            return {
                success: false,
                error: 'Another operation is in progress',
            };
        }

        try {
            setPendingOperation('sell');
            setError(null);

            const data = await walletApi.sellPoints(payoutData);

            // Refresh wallet to show updated balance (points already debited)
            await refreshWallet();

            return {
                success: true,
                data,
            };
        } catch (err) {
            console.error('Sell points failed:', err);
            const errorMessage =
                err.response?.data?.message || 'Failed to request payout';
            setError(errorMessage);

            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            setPendingOperation(null);
        }
    };

    /**
     * Clear error state
     */
    const clearError = () => {
        setError(null);
    };

    /**
     * Check if user has sufficient balance
     *
     * @param {number} amount - Amount to check
     * @returns {boolean}
     */
    const hasSufficientBalance = amount => {
        if (!wallet) return false;
        return wallet.available_balance >= amount;
    };

    /**
     * Get exchange rate for a currency
     *
     * @param {string} currency - Currency code
     * @returns {Object|null} - Rate object or null
     */
    const getRate = currency => {
        return exchangeRates.find(r => r.currency === currency) || null;
    };

    const value = {
        // State
        wallet,
        exchangeRates,
        recentTransactions,
        isLoading,
        error,
        pendingOperation,

        // Methods
        refreshWallet,
        refreshExchangeRates,
        buyPoints,
        sellPoints,
        clearError,
        hasSufficientBalance,
        getRate,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

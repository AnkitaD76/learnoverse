import { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { calculatePoints, calculateCash } from '../../api/wallet';

/**
 * EXCHANGE RATE SELECTOR
 *
 * Currency selector with live exchange rate calculation.
 *
 * FEATURES:
 * - Select currency
 * - Input cash amount → show points
 * - Input points amount → show cash
 * - Live calculation
 * - Display current rate
 */
const ExchangeRateSelector = ({
    mode = 'buy', // 'buy' or 'sell'
    onAmountChange,
    defaultCurrency = 'USD',
}) => {
    const { exchangeRates, getRate } = useWallet();

    const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
    const [cashAmount, setCashAmount] = useState('');
    const [pointsAmount, setPointsAmount] = useState('');
    const [activeInput, setActiveInput] = useState('cash'); // 'cash' or 'points'

    const selectedRate = getRate(selectedCurrency);

    // Recalculate when currency changes
    useEffect(() => {
        if (selectedRate) {
            if (activeInput === 'cash' && cashAmount) {
                const points = calculatePoints(
                    parseFloat(cashAmount),
                    selectedRate.rate
                );
                setPointsAmount(points.toString());

                onAmountChange?.({
                    currency: selectedCurrency,
                    cash_amount: parseFloat(cashAmount),
                    points_amount: points,
                    rate: selectedRate.rate,
                });
            } else if (activeInput === 'points' && pointsAmount) {
                const cash = calculateCash(
                    parseInt(pointsAmount),
                    selectedRate.rate
                );
                setCashAmount(cash.toString());

                onAmountChange?.({
                    currency: selectedCurrency,
                    cash_amount: cash,
                    points_amount: parseInt(pointsAmount),
                    rate: selectedRate.rate,
                });
            }
        }
    }, [selectedCurrency, selectedRate]);

    const handleCashChange = value => {
        setCashAmount(value);
        setActiveInput('cash');

        if (value && !isNaN(parseFloat(value)) && selectedRate) {
            const numValue = parseFloat(value);
            if (numValue >= 0) {
                const points = calculatePoints(numValue, selectedRate.rate);
                setPointsAmount(points.toString());

                onAmountChange?.({
                    currency: selectedCurrency,
                    cash_amount: numValue,
                    points_amount: points,
                    rate: selectedRate.rate,
                });
            }
        } else if (!value || value === '') {
            setPointsAmount('');
            onAmountChange?.(null);
        }
    };

    

    const handlePointsChange = value => {
        setPointsAmount(value);
        setActiveInput('points');

        if (value && !isNaN(parseInt(value)) && selectedRate) {
            const numValue = parseInt(value);
            if (numValue >= 0) {
                const cash = calculateCash(numValue, selectedRate.rate);
                setCashAmount(cash.toFixed(2));

                onAmountChange?.({
                    currency: selectedCurrency,
                    cash_amount: cash,
                    points_amount: numValue,
                    rate: selectedRate.rate,
                });
            }
        } else if (!value || value === '') {
            setCashAmount('');
            onAmountChange?.(null);
        }
    };

    const handleCurrencyChange = currency => {
        setSelectedCurrency(currency);
    };

    return (
        <div className="exchange-rate-selector">
            <div className="currency-selector">
                <label htmlFor="currency">Currency</label>
                <select
                    id="currency"
                    value={selectedCurrency}
                    onChange={e => handleCurrencyChange(e.target.value)}
                    className="currency-select"
                >
                    {exchangeRates.map(rate => (
                        <option key={rate.currency} value={rate.currency}>
                            {rate.currency}
                        </option>
                    ))}
                </select>
            </div>

            {selectedRate && (
                <div className="rate-info">
                    <span className="rate-label">Exchange Rate:</span>
                    <span className="rate-value">
                        {selectedRate.description}
                    </span>
                </div>
            )}

            {/* Conversion Summary */}
            {cashAmount && pointsAmount && (
                <div className="conversion-summary">
                    <div className="summary-content">
                        {mode === 'buy' ? (
                            <>
                                <span className="summary-label">You Pay:</span>
                                <span className="summary-amount">
                                    {selectedCurrency}{' '}
                                    {parseFloat(cashAmount).toFixed(2)}
                                </span>
                                <span className="summary-arrow">→</span>
                                <span className="summary-label">You Get:</span>
                                <span className="summary-points">
                                    {parseInt(pointsAmount).toLocaleString()}{' '}
                                    Points
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="summary-label">You Sell:</span>
                                <span className="summary-points">
                                    {parseInt(pointsAmount).toLocaleString()}{' '}
                                    Points
                                </span>
                                <span className="summary-arrow">→</span>
                                <span className="summary-label">You Get:</span>
                                <span className="summary-amount">
                                    {selectedCurrency}{' '}
                                    {parseFloat(cashAmount).toFixed(2)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="amount-inputs">
                {mode === 'buy' ? (
                    <>
                        <div className="input-group">
                            <label htmlFor="cash">
                                {selectedCurrency} Amount
                            </label>
                            <input
                                id="cash"
                                type="number"
                                min="0"
                                step="0.01"
                                value={cashAmount}
                                onChange={e => handleCashChange(e.target.value)}
                                placeholder="0.00"
                                className="amount-input"
                            />
                        </div>

                        <div className="conversion-arrow">↓</div>

                        <div className="input-group">
                            <label htmlFor="points">
                                Points You'll Receive
                            </label>
                            <input
                                id="points"
                                type="number"
                                min="0"
                                value={pointsAmount}
                                onChange={e =>
                                    handlePointsChange(e.target.value)
                                }
                                placeholder="0"
                                className="amount-input"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="input-group">
                            <label htmlFor="points">Points to Sell</label>
                            <input
                                id="points"
                                type="number"
                                min="0"
                                value={pointsAmount}
                                onChange={e =>
                                    handlePointsChange(e.target.value)
                                }
                                placeholder="0"
                                className="amount-input"
                            />
                        </div>

                        <div className="conversion-arrow">↓</div>

                        <div className="input-group">
                            <label htmlFor="cash">
                                {selectedCurrency} You'll Receive
                            </label>
                            <input
                                id="cash"
                                type="number"
                                min="0"
                                step="0.01"
                                value={cashAmount}
                                onChange={e => handleCashChange(e.target.value)}
                                placeholder="0.00"
                                className="amount-input"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExchangeRateSelector;

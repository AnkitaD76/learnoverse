import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { calculatePoints, calculateCash } from '../../api/wallet';

/**
 * EXCHANGE RATE SELECTOR
 *
 * Bidirectional currency/points converter with live calculation.
 * Type in either field and the other updates automatically.
 */
const ExchangeRateSelector = ({
    mode = 'buy',
    onAmountChange,
    defaultCurrency = 'USD',
}) => {
    const { exchangeRates, getRate } = useWallet();

    const [currency, setCurrency] = useState(defaultCurrency);
    const [cash, setCash] = useState('');
    const [points, setPoints] = useState('');
    const [source, setSource] = useState(null); // 'cash' | 'points'

    const rateObj = getRate(currency);
    const rate = rateObj?.rate;

    const recalculate = useCallback(() => {
        if (!rate || !source || !exchangeRates || exchangeRates.length === 0)
            return;

        if (source === 'cash' && cash !== '') {
            const cashNum = Number(cash);
            if (isNaN(cashNum) || cashNum < 0) return;

            const pts = calculatePoints(cashNum, currency, exchangeRates);
            setPoints(String(pts));

            onAmountChange?.({
                currency,
                cash_amount: cashNum,
                points_amount: pts,
                rate,
            });
        }

        if (source === 'points' && points !== '') {
            const ptsNum = Number(points);
            if (isNaN(ptsNum) || ptsNum < 0) return;

            const cashVal = calculateCash(ptsNum, currency, exchangeRates);
            setCash(cashVal.toFixed(2));

            onAmountChange?.({
                currency,
                cash_amount: Number(cashVal.toFixed(2)),
                points_amount: ptsNum,
                rate,
            });
        }
    }, [cash, points, source, rate, currency, exchangeRates, onAmountChange]);

    useEffect(() => {
        recalculate();
    }, [recalculate]);

    const onCashChange = e => {
        setSource('cash');
        setCash(e.target.value);
        if (e.target.value === '') {
            setPoints('');
            onAmountChange?.(null);
        }
    };

    const onPointsChange = e => {
        setSource('points');
        setPoints(e.target.value);
        if (e.target.value === '') {
            setCash('');
            onAmountChange?.(null);
        }
    };

    return (
        <div className="exchange-rate-selector">
            <div className="currency-selector">
                <label htmlFor="currency">Currency</label>
                <select
                    id="currency"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="currency-select"
                >
                    {exchangeRates.map(r => (
                        <option key={r.currency} value={r.currency}>
                            {r.currency}
                        </option>
                    ))}
                </select>
            </div>

            {rateObj && (
                <div className="rate-info">
                    <span className="rate-label">Exchange Rate:</span>
                    <span className="rate-value">{rateObj.description}</span>
                </div>
            )}

            {/* Conversion Summary */}
            {cash && points && (
                <div className="conversion-summary">
                    <div className="summary-content">
                        {mode === 'buy' ? (
                            <>
                                <span className="summary-label">You Pay:</span>
                                <span className="summary-amount">
                                    {currency} {parseFloat(cash).toFixed(2)}
                                </span>
                                <span className="summary-arrow">→</span>
                                <span className="summary-label">You Get:</span>
                                <span className="summary-points">
                                    {parseInt(points).toLocaleString()} Points
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="summary-label">You Sell:</span>
                                <span className="summary-points">
                                    {parseInt(points).toLocaleString()} Points
                                </span>
                                <span className="summary-arrow">→</span>
                                <span className="summary-label">You Get:</span>
                                <span className="summary-amount">
                                    {currency} {parseFloat(cash).toFixed(2)}
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
                            <label htmlFor="cash">{currency} Amount</label>
                            <input
                                id="cash"
                                type="number"
                                min="0"
                                step="0.01"
                                value={cash}
                                onChange={onCashChange}
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
                                value={points}
                                onChange={onPointsChange}
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
                                value={points}
                                onChange={onPointsChange}
                                placeholder="0"
                                className="amount-input"
                            />
                        </div>

                        <div className="conversion-arrow">↓</div>

                        <div className="input-group">
                            <label htmlFor="cash">
                                {currency} You'll Receive
                            </label>
                            <input
                                id="cash"
                                type="number"
                                min="0"
                                step="0.01"
                                value={cash}
                                onChange={onCashChange}
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

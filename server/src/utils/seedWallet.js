import ExchangeRate from '../models/ExchangeRate.js';

/**
 * WALLET SEED DATA
 *
 * Seeds initial exchange rates into the database.
 *
 * DEFAULT RATES:
 * - USD: 1 USD = 100 points (typical rate)
 * - BDT: 1 BDT = 1 point (local currency)
 * - EUR: 1 EUR = 110 points (slightly higher than USD)
 * - GBP: 1 GBP = 125 points (highest rate)
 *
 * USAGE:
 * Run this once during initial setup or when resetting the system.
 * Can be called from a migration script or admin endpoint.
 */
export const seedExchangeRates = async () => {
    try {
        console.log('💰 Seeding exchange rates...');

        // Check if rates already exist
        const existingRates = await ExchangeRate.countDocuments({
            is_active: true,
        });

        if (existingRates > 0) {
            console.log('ℹ️  Exchange rates already exist. Skipping seed.');
            return;
        }

        // Default exchange rates
        const defaultRates = [
            {
                currency: 'USD',
                rate: 100,
                is_active: true,
                effective_from: new Date(),
                change_reason: 'Initial system setup',
            },
            {
                currency: 'BDT',
                rate: 1,
                is_active: true,
                effective_from: new Date(),
                change_reason: 'Initial system setup',
            },
            {
                currency: 'EUR',
                rate: 110,
                is_active: true,
                effective_from: new Date(),
                change_reason: 'Initial system setup',
            },
            {
                currency: 'GBP',
                rate: 125,
                is_active: true,
                effective_from: new Date(),
                change_reason: 'Initial system setup',
            },
        ];

        await ExchangeRate.insertMany(defaultRates);

        console.log('✅ Exchange rates seeded successfully:');
        console.log('   - USD: 1 = 100 points');
        console.log('   - BDT: 1 = 1 point');
        console.log('   - EUR: 1 = 110 points');
        console.log('   - GBP: 1 = 125 points');
    } catch (error) {
        console.error('❌ Error seeding exchange rates:', error);
        throw error;
    }
};

/**
 * RESET EXCHANGE RATES
 *
 * Deactivates all current rates and seeds fresh ones.
 * USE WITH CAUTION - this affects all future transactions.
 */
export const resetExchangeRates = async () => {
    try {
        console.log('🔄 Resetting exchange rates...');

        // Deactivate all current rates
        await ExchangeRate.updateMany(
            { is_active: true },
            {
                $set: {
                    is_active: false,
                    effective_until: new Date(),
                },
            }
        );

        console.log('✅ All existing rates deactivated');

        // Seed new rates
        await seedExchangeRates();
    } catch (error) {
        console.error('❌ Error resetting exchange rates:', error);
        throw error;
    }
};

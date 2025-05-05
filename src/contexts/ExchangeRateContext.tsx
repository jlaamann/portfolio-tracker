import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface ExchangeRateContextType {
    exchangeRates: Record<string, number>;
    isLoading: boolean;
    error: string | null;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export const useExchangeRates = () => {
    const context = useContext(ExchangeRateContext);
    if (context === undefined) {
        throw new Error('useExchangeRates must be used within an ExchangeRateProvider');
    }
    return context;
};

interface ExchangeRateProviderProps {
    children: React.ReactNode;
    currencies: string[];
}

export const ExchangeRateProvider: React.FC<ExchangeRateProviderProps> = ({ children, currencies }) => {
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExchangeRates = async () => {
            setIsLoading(true);
            setError(null);
            const rates: Record<string, number> = {};

            try {
                for (const currency of currencies) {
                    if (currency === 'EUR') {
                        rates[currency] = 1;
                        continue;
                    }
                    const response = await axios.get(
                        `http://localhost:3001/api/currency/${currency}/EUR`
                    );
                    rates[currency] = response.data.chart.result[0].meta.regularMarketPrice;
                }
                setExchangeRates(rates);
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
                setError('Failed to fetch exchange rates');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExchangeRates();
    }, [currencies]);

    return (
        <ExchangeRateContext.Provider value={{ exchangeRates, isLoading, error }}>
            {children}
        </ExchangeRateContext.Provider>
    );
}; 
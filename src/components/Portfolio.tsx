import { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    useToast,
    Heading,

} from '@chakra-ui/react';
import { addPosition, getAllPositions, deletePosition, saveCashPosition, getCashPosition } from '../db/setup';
import axios from 'axios';
import { PortfolioSummary } from './PortfolioSummary';
import { PortfolioTable } from './PortfolioTable';
import { ExchangeRateProvider } from '../contexts/ExchangeRateContext';
import { AddPositionForm } from './AddPositionForm';

interface PortfolioPosition {
    id: number;
    ticker: string;
    shares: number;
    buy_price: number;
    currency: string;
    market_value?: number | null;
}

const Portfolio = () => {
    const [positions, setPositions] = useState<PortfolioPosition[]>([]);
    const [cashValue, setCashValue] = useState(0);
    const toast = useToast();

    // Get unique currencies from positions
    const currencies = [...new Set(positions.map(pos => pos.currency))];

    // Calculate total portfolio value
    const totalPortfolioValue = positions.reduce((sum, pos) => {
        if (pos.market_value === null || pos.market_value === undefined) return sum;
        return sum + (pos.market_value * pos.shares);
    }, 0) + cashValue;

    const loadCashPosition = async () => {
        try {
            const cash = await getCashPosition();
            setCashValue(cash);
        } catch (error) {
            toast({
                title: 'Error loading cash position',
                status: 'error',
                duration: 2000,
            });
        }
    };

    const loadPositions = async () => {
        try {
            const positions = await getAllPositions();
            setPositions(positions);
        } catch (error) {
            toast({
                title: 'Error loading positions',
                status: 'error',
                duration: 2000,
            });
        }
    };

    useEffect(() => {
        loadPositions();
        loadCashPosition();
    }, []);

    const handleSaveCash = async (amount: number) => {
        try {
            await saveCashPosition(amount);
            setCashValue(amount);
            toast({
                title: 'Cash position saved',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Error saving cash position',
                status: 'error',
                duration: 2000,
            });
            throw error;
        }
    };

    const handleCashValueChange = (value: number) => {
        setCashValue(value);
    };

    const handleAddPosition = async (data: {
        ticker: string;
        shares: number;
        buy_price: number;
        currency: string;
    }) => {
        try {
            await addPosition(data);
            toast({
                title: 'Position added',
                status: 'success',
                duration: 2000,
            });
            loadPositions();
        } catch (error) {
            toast({
                title: 'Error adding position',
                status: 'error',
                duration: 2000,
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deletePosition(id);
            loadPositions();
            toast({
                title: 'Position deleted',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Error deleting position',
                status: 'error',
                duration: 2000,
            });
        }
    };

    const handleSavePosition = async (data: { id: number; ticker: string; shares: number; buy_price: number }) => {
        try {
            const oldPosition = positions.find(p => p.id === data.id);
            if (!oldPosition) return;

            // If ticker has changed, delete the old position first
            if (oldPosition.ticker !== data.ticker) {
                await deletePosition(oldPosition.id);
            }

            // Add the new/updated position
            await addPosition({
                ticker: data.ticker,
                shares: data.shares,
                buy_price: data.buy_price,
                currency: oldPosition.currency,
            }, true);

            toast({
                title: 'Position updated',
                status: 'success',
                duration: 2000,
            });

            loadPositions();
        } catch (error) {
            toast({
                title: 'Error updating position',
                status: 'error',
                duration: 2000,
            });
            throw error;
        }
    };

    const fetchMarketValue = async (ticker: string, currency: string) => {
        try {
            const response = await axios.get(
                `http://localhost:3001/api/stock/${ticker}`
            );

            if (!response.data.chart.result || response.data.chart.result.length === 0) {
                return null;
            }

            const quote = response.data.chart.result[0].meta;
            const price = quote.regularMarketPrice;

            // Convert to EUR if needed
            if (currency !== 'EUR') {
                const exchangeResponse = await axios.get(
                    `http://localhost:3001/api/currency/${currency}/EUR`
                );
                const exchangeRate = exchangeResponse.data.chart.result[0].meta.regularMarketPrice;
                return price * exchangeRate;
            }

            return price;
        } catch (error) {
            console.error('Error fetching market value:', error);
            return null;
        }
    };

    useEffect(() => {
        const updateMarketValues = async () => {
            const updatedPositions = await Promise.all(
                positions.map(async (position) => {
                    const marketValue = await fetchMarketValue(position.ticker, position.currency);
                    return { ...position, market_value: marketValue };
                })
            );
            setPositions(updatedPositions);
        };

        updateMarketValues();
    }, [positions.length]);

    return (
        <ExchangeRateProvider currencies={currencies}>
            <Box p={{ base: 2, md: 5 }}>
                <VStack spacing={8} align="stretch">
                    <Heading size="lg" textAlign="center">My Portfolio</Heading>
                    <PortfolioSummary
                        positions={positions}
                        cashValue={cashValue}
                        onCashValueChange={handleCashValueChange}
                        onSaveCash={handleSaveCash}
                    />

                    <AddPositionForm onSubmit={handleAddPosition} />

                    <PortfolioTable
                        positions={positions}
                        totalPortfolioValue={totalPortfolioValue}
                        onDelete={handleDelete}
                        onSave={handleSavePosition}
                    />
                </VStack>
            </Box>
        </ExchangeRateProvider>
    );
};

export default Portfolio; 
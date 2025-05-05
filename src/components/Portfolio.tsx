import { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    Heading,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
    SimpleGrid,
} from '@chakra-ui/react';
import { addPosition, getAllPositions, deletePosition, saveCashPosition, getCashPosition } from '../db/setup';
import axios from 'axios';
import { PortfolioSummary } from './PortfolioSummary';
import { PortfolioTable } from './PortfolioTable';
import { ExchangeRateProvider } from '../contexts/ExchangeRateContext';

interface PortfolioPosition {
    id: number;
    ticker: string;
    shares: number;
    buy_price: number;
    currency: string;
    market_value?: number | null;
}

interface EditingPosition {
    id: number;
    ticker: string;
    shares: string;
    buy_price: string;
}

interface AddPositionFormProps {
    onSubmit: (data: {
        ticker: string;
        shares: number;
        buy_price: number;
        currency: string;
    }) => Promise<void>;
}

const AddPositionForm = ({ onSubmit }: AddPositionFormProps) => {
    const [formData, setFormData] = useState({
        ticker: '',
        shares: '',
        buy_price: '',
        currency: 'USD',
    });

    const handleFormChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit({
                ticker: formData.ticker.toUpperCase(),
                shares: parseFloat(formData.shares),
                buy_price: parseFloat(formData.buy_price),
                currency: formData.currency,
            });

            setFormData({
                ticker: '',
                shares: '',
                buy_price: '',
                currency: 'USD',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} p={{ base: 3, md: 5 }} shadow="md" borderWidth="1px" borderRadius="md">
            <VStack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                    <FormControl isRequired>
                        <FormLabel>Ticker Symbol</FormLabel>
                        <Input
                            value={formData.ticker}
                            onChange={(e) => handleFormChange('ticker', e.target.value)}
                            placeholder="e.g., AAPL"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Number of Shares</FormLabel>
                        <NumberInput
                            value={formData.shares}
                            onChange={(value) => handleFormChange('shares', value)}
                            precision={4}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Average Price</FormLabel>
                        <NumberInput
                            value={formData.buy_price}
                            onChange={(value) => handleFormChange('buy_price', value)}
                            min={0}
                            precision={2}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Currency</FormLabel>
                        <Select
                            value={formData.currency}
                            onChange={(e) => handleFormChange('currency', e.target.value)}
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                        </Select>
                    </FormControl>
                </SimpleGrid>

                <Button type="submit" colorScheme="blue" width="full">
                    Add Position
                </Button>
            </VStack>
        </Box>
    );
};

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
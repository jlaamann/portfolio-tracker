import {
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    HStack,
    IconButton,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface PortfolioPosition {
    id: number;
    ticker: string;
    shares: number;
    buy_price: number;
    currency: string;
    market_value?: number | null;
}

interface PortfolioSummaryProps {
    positions: PortfolioPosition[];
    cashValue: number;
    onCashValueChange: (value: number) => void;
    onSaveCash: () => Promise<void>;
}

export const PortfolioSummary = ({ positions, cashValue, onCashValueChange, onSaveCash }: PortfolioSummaryProps) => {
    const [localCashValue, setLocalCashValue] = useState(cashValue);
    const [isCashModified, setIsCashModified] = useState(false);
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

    useEffect(() => {
        setLocalCashValue(cashValue);
        setIsCashModified(false);
    }, [cashValue]);

    // Fetch exchange rates for all currencies
    useEffect(() => {
        const fetchExchangeRates = async () => {
            const currencies = [...new Set(positions.map(pos => pos.currency))];
            const rates: Record<string, number> = {};

            for (const currency of currencies) {
                if (currency === 'EUR') {
                    rates[currency] = 1;
                    continue;
                }
                try {
                    const response = await axios.get(
                        `http://localhost:3001/api/currency/${currency}/EUR`
                    );
                    rates[currency] = response.data.chart.result[0].meta.regularMarketPrice;
                } catch (error) {
                    console.error(`Error fetching exchange rate for ${currency}:`, error);
                    rates[currency] = 1; // Fallback to 1 if fetch fails
                }
            }
            setExchangeRates(rates);
        };

        fetchExchangeRates();
    }, [positions]);

    const handleCashChange = (value: string) => {
        const newValue = Number(value);
        setLocalCashValue(newValue);
        onCashValueChange(newValue);
        setIsCashModified(true);
    };

    const handleSave = async () => {
        try {
            await onSaveCash();
            setIsCashModified(false);
        } catch (error) {
            console.error('Failed to save cash position:', error);
        }
    };

    const totalCost = positions.reduce((sum, pos) => {
        const costInOriginalCurrency = pos.buy_price * pos.shares;
        const exchangeRate = exchangeRates[pos.currency] || 1;
        return sum + (costInOriginalCurrency * exchangeRate);
    }, 0);

    const stockValue = positions.reduce((sum, pos) => {
        if (pos.market_value === null || pos.market_value === undefined) return sum;
        return sum + (pos.market_value * pos.shares);
    }, 0);

    const totalValue = stockValue + localCashValue;
    const profitLoss = stockValue - totalCost;
    const profitLossPercentage = (profitLoss / totalCost) * 100;

    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%" mb={4}>
            <Stat>
                <StatLabel>Total Portfolio Value</StatLabel>
                <StatNumber>€{totalValue.toFixed(2)}</StatNumber>
                <FormControl mt={2}>
                    <FormLabel fontSize="sm">Cash Position (€)</FormLabel>
                    <HStack>
                        <NumberInput
                            value={localCashValue}
                            onChange={handleCashChange}
                            min={0}
                            precision={2}
                            size="sm"
                            flex="1"
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        {isCashModified && (
                            <IconButton
                                aria-label="Save cash position"
                                icon={<CheckIcon />}
                                colorScheme="green"
                                size="sm"
                                onClick={handleSave}
                            />
                        )}
                    </HStack>
                </FormControl>
            </Stat>
            <Stat>
                <StatLabel>Profit/Loss</StatLabel>
                <StatNumber color={profitLoss >= 0 ? 'green.500' : 'red.500'}>
                    €{profitLoss.toFixed(2)}
                </StatNumber>
                <StatHelpText>
                    <StatArrow type={profitLoss >= 0 ? 'increase' : 'decrease'} />
                    {profitLossPercentage.toFixed(2)}%
                </StatHelpText>
            </Stat>
        </SimpleGrid>
    );
}; 
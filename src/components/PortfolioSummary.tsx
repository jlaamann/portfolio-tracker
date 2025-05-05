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
    onSaveCash: () => void;
}

export const PortfolioSummary = ({ positions, cashValue, onCashValueChange, onSaveCash }: PortfolioSummaryProps) => {
    const totalCost = positions.reduce((sum, pos) => sum + (pos.buy_price * pos.shares), 0);
    const stockValue = positions.reduce((sum, pos) => {
        if (pos.market_value === null || pos.market_value === undefined) return sum;
        return sum + (pos.market_value * pos.shares);
    }, 0);
    const totalValue = stockValue + cashValue;
    const profitLoss = stockValue - totalCost;
    const profitLossPercentage = (profitLoss / totalCost) * 100;

    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%" mb={4}>
            <Stat>
                <StatLabel>Total Portfolio Value</StatLabel>
                <StatNumber>€{totalValue.toFixed(2)}</StatNumber>
                <FormControl mt={2}>
                    <FormLabel fontSize="sm">Cash Position</FormLabel>
                    <HStack>
                        <NumberInput
                            value={cashValue}
                            onChange={(value) => onCashValueChange(Number(value))}
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
                        <IconButton
                            aria-label="Save cash position"
                            icon={<CheckIcon />}
                            colorScheme="green"
                            size="sm"
                            onClick={onSaveCash}
                        />
                    </HStack>
                </FormControl>
            </Stat>
            <Stat>
                <StatLabel>Stock Profit/Loss</StatLabel>
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
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    HStack,
    useBreakpointValue,
    Text,
    Center,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useExchangeRates } from '../contexts/ExchangeRateContext';

interface PortfolioPosition {
    id: number;
    ticker: string;
    shares: number;
    buy_price: number;
    currency: string;
    market_value?: number | null;
}

interface PositionReturn {
    absolute: number;
    percentage: number;
    costBasisInEUR: number;
    marketValue: number;
}

interface EditingPosition {
    id: number;
    ticker: string;
    shares: string;
    buy_price: string;
}

interface PortfolioTableProps {
    positions: PortfolioPosition[];
    editingPosition: EditingPosition | null;
    totalPortfolioValue: number;
    onEdit: (position: PortfolioPosition) => void;
    onDelete: (id: number) => void;
    onSave: () => void;
    onCancel: () => void;
    onEditingPositionChange: (position: EditingPosition) => void;
}

export const PortfolioTable = ({
    positions,
    editingPosition,
    totalPortfolioValue,
    onEdit,
    onDelete,
    onSave,
    onCancel,
    onEditingPositionChange,
}: PortfolioTableProps) => {
    const [positionReturns, setPositionReturns] = useState<Record<number, PositionReturn>>({});
    const { exchangeRates, isLoading, error } = useExchangeRates();
    const tableSize = useBreakpointValue({ base: "sm", md: "md" });

    const getPriceString = (price: number, currency: string) => {
        return price.toLocaleString('en-US', {
            style: 'currency',
            currency: currency ?? "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getPositionPercentage = (position: PortfolioPosition) => {
        if (position.market_value === null || position.market_value === undefined || totalPortfolioValue === 0) return 0;
        return ((position.market_value * position.shares) / totalPortfolioValue) * 100;
    };

    const getPositionReturn = (position: PortfolioPosition) => {
        if (position.market_value === null || position.market_value === undefined) return { absolute: 0, percentage: 0, costBasisInEUR: 0, marketValue: 0 };

        // Calculate cost basis in original currency
        const costBasis = position.shares * position.buy_price;

        // Calculate market value in EUR
        let marketValue = position.market_value * position.shares;

        // Convert cost basis to EUR for comparison
        let costBasisInEUR = costBasis;
        if (position.currency !== 'EUR') {
            const exchangeRate = exchangeRates[position.currency] || 1;
            costBasisInEUR = costBasis * exchangeRate;
        }

        const absoluteReturn = marketValue - costBasisInEUR;
        const percentageReturn = (absoluteReturn / costBasisInEUR) * 100;

        return {
            absolute: absoluteReturn,
            percentage: percentageReturn,
            costBasisInEUR,
            marketValue
        };
    };

    useEffect(() => {
        const newReturns: Record<number, PositionReturn> = {};
        for (const position of positions) {
            if (position.market_value !== null && position.market_value !== undefined) {
                newReturns[position.id] = getPositionReturn(position);
            }
        }
        setPositionReturns(newReturns);
    }, [positions, exchangeRates]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <Center p={4}>
                    <Text>Loading exchange rates...</Text>
                </Center>
            );
        }

        if (error) {
            return (
                <Center p={4}>
                    <Text color="red.500">Error loading exchange rates: {error}</Text>
                </Center>
            );
        }

        return (
            <Table variant="simple" size={tableSize}>
                <Thead>
                    <Tr>
                        <Th>Ticker</Th>
                        <Th>Shares</Th>
                        <Th>Avg Price</Th>
                        <Th>Currency</Th>
                        <Th>Market Value</Th>
                        <Th>% of Portfolio</Th>
                        <Th>Total Return</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {positions.map((position) => (
                        <Tr key={position.id}>
                            <Td>
                                {editingPosition?.id === position.id ? (
                                    <Input
                                        value={editingPosition.ticker}
                                        onChange={(e) => onEditingPositionChange({
                                            ...editingPosition,
                                            ticker: e.target.value
                                        })}
                                        size="sm"
                                    />
                                ) : (
                                    position.ticker
                                )}
                            </Td>
                            <Td>
                                {editingPosition?.id === position.id ? (
                                    <NumberInput
                                        value={editingPosition.shares}
                                        onChange={(value) => onEditingPositionChange({
                                            ...editingPosition,
                                            shares: value
                                        })}
                                        precision={4}
                                        size="sm"
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                ) : (
                                    position.shares
                                )}
                            </Td>
                            <Td>
                                {editingPosition?.id === position.id ? (
                                    <NumberInput
                                        value={editingPosition.buy_price}
                                        onChange={(value) => onEditingPositionChange({
                                            ...editingPosition,
                                            buy_price: value
                                        })}
                                        min={0}
                                        precision={2}
                                        size="sm"
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                ) : (
                                    position.buy_price
                                )}
                            </Td>
                            <Td>{position.currency}</Td>
                            <Td>
                                {position.market_value !== undefined && position.market_value !== null
                                    ? getPriceString(position.market_value * position.shares, 'EUR')
                                    : 'Loading...'}
                            </Td>
                            <Td>
                                {position.market_value !== undefined && position.market_value !== null
                                    ? `${getPositionPercentage(position).toFixed(2)}%`
                                    : 'Loading...'}
                            </Td>
                            <Td>
                                {position.market_value !== undefined && position.market_value !== null ? (
                                    <Box>
                                        <Box color={positionReturns[position.id]?.absolute >= 0 ? 'green.500' : 'red.500'}>
                                            {getPriceString(positionReturns[position.id]?.absolute || 0, 'EUR')}
                                        </Box>
                                        <Box fontSize="sm" color={positionReturns[position.id]?.percentage >= 0 ? 'green.500' : 'red.500'}>
                                            {positionReturns[position.id]?.percentage.toFixed(2) || '0.00'}%
                                        </Box>
                                    </Box>
                                ) : (
                                    'Loading...'
                                )}
                            </Td>
                            <Td>
                                <HStack spacing={2}>
                                    {editingPosition?.id === position.id ? (
                                        <>
                                            <IconButton
                                                aria-label="Save changes"
                                                icon={<CheckIcon />}
                                                colorScheme="green"
                                                size="sm"
                                                onClick={onSave}
                                            />
                                            <IconButton
                                                aria-label="Cancel editing"
                                                icon={<CloseIcon />}
                                                colorScheme="gray"
                                                size="sm"
                                                onClick={onCancel}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <IconButton
                                                aria-label="Edit position"
                                                icon={<EditIcon />}
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={() => onEdit(position)}
                                            />
                                            <IconButton
                                                aria-label="Delete position"
                                                icon={<DeleteIcon />}
                                                colorScheme="red"
                                                size="sm"
                                                onClick={() => onDelete(position.id)}
                                            />
                                        </>
                                    )}
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        );
    };

    return (
        <Box overflowX="auto" width="100%">
            {renderContent()}
        </Box>
    );
}; 
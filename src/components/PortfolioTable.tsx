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
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

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
    const getPositionPercentage = (position: PortfolioPosition) => {
        if (position.market_value === null || position.market_value === undefined || totalPortfolioValue === 0) return 0;
        return ((position.market_value * position.shares) / totalPortfolioValue) * 100;
    };

    const getPositionReturn = (position: PortfolioPosition) => {
        if (position.market_value === null || position.market_value === undefined) return { absolute: 0, percentage: 0 };
        const costBasis = position.shares * position.buy_price;
        const marketValue = position.market_value * position.shares;
        const absoluteReturn = marketValue - costBasis;
        const percentageReturn = (absoluteReturn / costBasis) * 100;
        return { absolute: absoluteReturn, percentage: percentageReturn };
    };

    return (
        <Box overflowX="auto" width="100%">
            <Table variant="simple" size={useBreakpointValue({ base: "sm", md: "md" })}>
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
                                        min={1}
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
                                    ? `€${(position.market_value * position.shares).toFixed(2)}`
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
                                        <Box color={getPositionReturn(position).absolute >= 0 ? 'green.500' : 'red.500'}>
                                            €{getPositionReturn(position).absolute.toFixed(2)}
                                        </Box>
                                        <Box fontSize="sm" color={getPositionReturn(position).percentage >= 0 ? 'green.500' : 'red.500'}>
                                            {getPositionReturn(position).percentage.toFixed(2)}%
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
        </Box>
    );
}; 
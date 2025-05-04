import { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    useToast,
    Heading,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { addPosition, getAllPositions, deletePosition } from '../db/setup';
import { ALPHA_VANTAGE_API_KEY } from '../API_KEY';
import axios from 'axios';

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
    const [formData, setFormData] = useState({
        ticker: '',
        shares: '',
        buy_price: '',
        currency: 'USD',
    });
    const toast = useToast();

    useEffect(() => {
        loadPositions();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addPosition({
                ticker: formData.ticker.toUpperCase(),
                shares: parseInt(formData.shares),
                buy_price: parseFloat(formData.buy_price),
                currency: formData.currency,
            });

            toast({
                title: 'Position added',
                status: 'success',
                duration: 2000,
            });

            setFormData({
                ticker: '',
                shares: '',
                buy_price: '',
                currency: 'USD',
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

    const fetchMarketValue = async (ticker: string, currency: string) => {
        try {
            const response = await axios.get(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
            );

            if (response.data['Error Message']) {
                return null;
            }

            const quote = response.data['Global Quote'];
            if (!quote) {
                return null;
            }

            const price = parseFloat(quote['05. price']);

            // Convert to EUR if needed
            if (currency !== 'EUR') {
                const exchangeResponse = await axios.get(
                    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${currency}&to_currency=EUR&apikey=${ALPHA_VANTAGE_API_KEY}`
                );
                const rate = parseFloat(exchangeResponse.data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
                return price * rate;
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
        <Box p={5}>
            <VStack spacing={8} align="stretch">
                <Heading size="lg">Portfolio Management</Heading>

                <Box as="form" onSubmit={handleSubmit} p={5} shadow="md" borderWidth="1px" borderRadius="md">
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Ticker Symbol</FormLabel>
                            <Input
                                value={formData.ticker}
                                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                                placeholder="e.g., AAPL"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Number of Shares</FormLabel>
                            <NumberInput
                                value={formData.shares}
                                onChange={(value) => setFormData({ ...formData, shares: value })}
                                min={1}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Buy Price</FormLabel>
                            <NumberInput
                                value={formData.buy_price}
                                onChange={(value) => setFormData({ ...formData, buy_price: value })}
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
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="JPY">JPY</option>
                            </Select>
                        </FormControl>

                        <Button type="submit" colorScheme="blue" width="full">
                            Add Position
                        </Button>
                    </VStack>
                </Box>

                <Box overflowX="auto">
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Ticker</Th>
                                <Th>Shares</Th>
                                <Th>Buy Price</Th>
                                <Th>Currency</Th>
                                <Th>Market Value (EUR)</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {positions.map((position) => (
                                <Tr key={position.id}>
                                    <Td>{position.ticker}</Td>
                                    <Td>{position.shares}</Td>
                                    <Td>{position.buy_price}</Td>
                                    <Td>{position.currency}</Td>
                                    <Td>
                                        {position.market_value !== undefined && position.market_value !== null
                                            ? `€${(position.market_value * position.shares).toFixed(2)}`
                                            : 'Loading...'}
                                    </Td>
                                    <Td>
                                        <IconButton
                                            aria-label="Delete position"
                                            icon={<DeleteIcon />}
                                            colorScheme="red"
                                            size="sm"
                                            onClick={() => handleDelete(position.id)}
                                        />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
        </Box>
    );
};

export default Portfolio; 
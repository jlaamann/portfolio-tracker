import { useState } from 'react'
import {
    Box,
    Input,
    Button,
    VStack,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
    useBreakpointValue,
    HStack,
    Text,
} from '@chakra-ui/react'
import axios from 'axios'

interface StockData {
    symbol: string
    currency: string
    timestamps: number[]
    prices: number[]
    high: number[]
    low: number[]
    volume: number[]
}

const HistoricalTicker = () => {
    const [ticker, setTicker] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [stockData, setStockData] = useState<StockData | null>(null)
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const tableSize = useBreakpointValue({ base: "sm", md: "md" })

    const getPriceString = (price: number, currency: string) => {
        return price.toLocaleString('en-US', { style: 'currency', currency: currency ?? "EUR" });
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    }

    const fetchStockData = async () => {
        if (!ticker) {
            toast({
                title: 'Please enter a ticker symbol',
                status: 'warning',
                duration: 2000,
            })
            return
        }

        if (!startDate || !endDate) {
            toast({
                title: 'Please select both start and end dates',
                status: 'warning',
                duration: 2000,
            })
            return
        }

        setLoading(true)
        try {
            const response = await axios.get(
                `http://localhost:3001/api/stock/${ticker}/historical?start=${startDate}&end=${endDate}`
            )

            if (!response.data.chart.result || response.data.chart.result.length === 0) {
                throw new Error('No data found for this ticker')
            }

            const result = response.data.chart.result[0];
            const quote = result.meta;
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];

            setStockData({
                symbol: ticker,
                currency: quote.currency,
                timestamps: timestamps,
                prices: quotes.close,
                high: quotes.high,
                low: quotes.low,
                volume: quotes.volume,
            })
        } catch (error) {
            toast({
                title: 'Error fetching stock data',
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 'error',
                duration: 3000,
            })
            setStockData(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box p={{ base: 2, md: 5 }}>
            <VStack spacing={8} align="stretch">
                <Heading size="lg" textAlign="center">Historical Stock Information</Heading>

                <Box>
                    <Input
                        placeholder="Enter ticker symbol (e.g., AAPL)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && fetchStockData()}
                        mb={2}
                    />
                    <HStack spacing={2} mb={2}>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </HStack>
                    <Button
                        colorScheme="blue"
                        onClick={fetchStockData}
                        isLoading={loading}
                        width="full"
                    >
                        Get Historical Data
                    </Button>
                </Box>

                {stockData && (
                    <Box overflowX="auto" width="100%">
                        <Table variant="simple" size={tableSize}>
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Close Price</Th>
                                    <Th>High</Th>
                                    <Th>Low</Th>
                                    <Th>Volume</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {stockData.timestamps.map((timestamp, index) => (
                                    <Tr key={timestamp}>
                                        <Td>{formatDate(timestamp)}</Td>
                                        <Td>{getPriceString(stockData.prices[index], stockData.currency)}</Td>
                                        <Td>{getPriceString(stockData.high[index], stockData.currency)}</Td>
                                        <Td>{getPriceString(stockData.low[index], stockData.currency)}</Td>
                                        <Td>{stockData.volume[index]?.toLocaleString() ?? 'N/A'}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                )}
            </VStack>
        </Box>
    )
}

export default HistoricalTicker 
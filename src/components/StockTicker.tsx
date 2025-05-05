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
} from '@chakra-ui/react'
import axios from 'axios'

interface StockData {
    symbol: string
    price: string
    currency: string
}

const StockTicker = () => {
    const [ticker, setTicker] = useState('')
    const [stockData, setStockData] = useState<StockData | null>(null)
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const tableSize = useBreakpointValue({ base: "sm", md: "md" })

    const getPriceString = (price: string, currency: string) => {
        const numericPrice = parseFloat(price);
        return numericPrice.toLocaleString('en-US', { style: 'currency', currency: currency ?? "EUR" });
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

        setLoading(true)
        try {
            const response = await axios.get(
                `http://localhost:3001/api/stock/${ticker}`
            )

            if (!response.data.chart.result || response.data.chart.result.length === 0) {
                throw new Error('No data found for this ticker')
            }

            const quote = response.data.chart.result[0].meta
            const regularMarketPrice = quote.regularMarketPrice

            setStockData({
                symbol: ticker,
                price: regularMarketPrice.toFixed(2),
                currency: quote.currency
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
                <Heading size="lg" textAlign="center">Stock Information</Heading>

                <Box>
                    <Input
                        placeholder="Enter ticker symbol (e.g., AAPL)"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && fetchStockData()}
                    />
                    <Button
                        mt={2}
                        colorScheme="blue"
                        onClick={fetchStockData}
                        isLoading={loading}
                        width="full"
                    >
                        Get Stock Data
                    </Button>
                </Box>

                {stockData && (
                    <Box overflowX="auto" width="100%">
                        <Table variant="simple" size={tableSize}>
                            <Thead>
                                <Tr>
                                    <Th>Metric</Th>
                                    <Th>Value</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>Current Price</Td>
                                    <Td>{getPriceString(stockData.price, stockData.currency)}</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>
                )}
            </VStack>
        </Box>
    )
}

export default StockTicker 
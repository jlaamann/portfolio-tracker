import { useState } from 'react'
import {
    Box,
    Input,
    Button,
    VStack,
    Text,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import { ALPHA_VANTAGE_API_KEY } from '../API_KEY'

interface StockData {
    symbol: string
    price: string
    change: string
    changePercent: string
    open: string
    high: string
    low: string
    volume: string
    previousClose: string
}

const StockTicker = () => {
    const [ticker, setTicker] = useState('')
    const [stockData, setStockData] = useState<StockData | null>(null)
    const [loading, setLoading] = useState(false)
    const toast = useToast()

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
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
            )

            if (response.data['Error Message']) {
                throw new Error(response.data['Error Message'])
            }

            const quote = response.data['Global Quote']
            if (!quote) {
                throw new Error('No data found for this ticker')
            }

            setStockData({
                symbol: quote['01. symbol'],
                price: quote['05. price'],
                change: quote['09. change'],
                changePercent: quote['10. change percent'],
                open: quote['02. open'],
                high: quote['03. high'],
                low: quote['04. low'],
                volume: quote['06. volume'],
                previousClose: quote['08. previous close'],
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
        <Box p={5}>
            <VStack spacing={8} align="stretch">
                <Heading size="lg">Stock Information</Heading>

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
                    <Box overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Metric</Th>
                                    <Th>Value</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>Current Price</Td>
                                    <Td>${stockData.price}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Change</Td>
                                    <Td>
                                        <Text color={parseFloat(stockData.change) >= 0 ? 'green.500' : 'red.500'}>
                                            {stockData.change} ({stockData.changePercent})
                                        </Text>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>Open</Td>
                                    <Td>${stockData.open}</Td>
                                </Tr>
                                <Tr>
                                    <Td>High</Td>
                                    <Td>${stockData.high}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Low</Td>
                                    <Td>${stockData.low}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Volume</Td>
                                    <Td>{parseInt(stockData.volume).toLocaleString()}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Previous Close</Td>
                                    <Td>${stockData.previousClose}</Td>
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
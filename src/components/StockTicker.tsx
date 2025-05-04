import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Box,
    Input,
    Button,
    VStack,
    Text,
    Heading,
} from '@chakra-ui/react'
import axios from 'axios'
import { ALPHA_VANTAGE_API_KEY } from '../API_KEY'

interface StockData {
    symbol: string
    price: number
    currency: string
}

const StockTicker = () => {
    const [ticker, setTicker] = useState('')

    const { data, isLoading, error, refetch } = useQuery<StockData | null>({
        queryKey: ['stock', ticker],
        queryFn: async () => {
            if (!ticker) return null
            try {
                const response = await axios.get(
                    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
                )

                if (response.data['Error Message']) {
                    throw new Error('Invalid stock symbol')
                }

                const quote = response.data['Global Quote']
                if (!quote) {
                    throw new Error('No data available for this symbol')
                }

                // Get currency information
                const companyResponse = await axios.get(
                    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
                )
                const companyInfo = companyResponse.data

                return {
                    symbol: quote['01. symbol'],
                    price: parseFloat(quote['05. price']),
                    currency: companyInfo.Currency || 'USD',
                }
            } catch (err) {
                console.error('API Error:', err)
                throw new Error('Failed to fetch stock data. Please check the ticker symbol and try again.')
            }
        },
        enabled: false,
        retry: 1,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!ticker) {
            alert('Please enter a stock ticker')
            return
        }
        refetch()
    }

    const formatPrice = (price: number, currency: string) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        })
        return formatter.format(price)
    }

    return (
        <Box w="100%">
            <form onSubmit={handleSubmit}>
                <VStack gap={4} align="stretch">
                    <Box>
                        <Heading size="sm" mb={2}>Stock Ticker Symbol</Heading>
                        <Input
                            placeholder="Enter stock ticker (e.g., AAPL)"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            size="lg"
                            autoFocus
                        />
                    </Box>
                    <Button type="submit" colorScheme="blue" size="lg" loading={isLoading}>
                        Get Stock Info
                    </Button>
                </VStack>
            </form>

            {error && (
                <Text color="red.500" mt={4}>
                    {error.message}
                </Text>
            )}

            {data && (
                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" mt={8}>
                    <Heading size="sm" mb={2}>{data.symbol} Price</Heading>
                    <Text fontSize="2xl" fontWeight="bold">
                        {formatPrice(data.price, data.currency)}
                    </Text>
                </Box>
            )}
        </Box>
    )
}

export default StockTicker 
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
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
} from '@chakra-ui/react'
import axios from 'axios'

interface StockData {
    symbol: string
    price: string
    currency: string
    marketCap: number
    enterpriseValue: number
    peRatio: number
    forwardPE: number
    pegRatio: number
    priceToSales: number
    priceToBook: number
    evToRevenue: number
    evToEbitda: number
    profitMargin: number
    revenue: number
    revenueGrowth: number
    operatingMargin: number
    ebitda: number
    ebitdaMargin: number
    netIncome: number
    eps: number
    dividendYield: number
    payoutRatio: number
    beta: number
    sector: string
    industry: string
}

const StockTicker = () => {
    const [ticker, setTicker] = useState('')
    const [stockData, setStockData] = useState<StockData | null>(null)
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const tableSize = useBreakpointValue({ base: "sm", md: "md" })

    const getPriceString = (price: number | string, currency: string) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        return numericPrice.toLocaleString('en-US', {
            style: 'currency',
            currency: currency ?? "USD",
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
    }

    const getMillionsString = (value: number) => {
        if (value === undefined || value === null) return 'N/A';
        const millions = value / 1000000;
        return `$${millions.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}M`;
    }

    const getLargeNumberString = (value: number) => {
        if (value >= 1e12) return `${(value / 1e12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}T`;
        if (value >= 1e9) return `${(value / 1e9).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
        if (value >= 1e6) return `${(value / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
        if (value >= 1e3) return `${(value / 1e3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}K`;
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const getPercentageString = (value: number) => {
        return `${(value * 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
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
                `http://localhost:3001/api/stock/${ticker}/detailed`
            )

            const quote = response.data.quote['Global Quote'];
            const overview = response.data.overview;
            const income = response.data.income.annualReports[0];
            const incomePreviousYear = response.data.income.annualReports.length > 1 ? response.data.income.annualReports[1] : null;

            if (!quote || !overview) {
                throw new Error('No data found for this ticker')
            }

            setStockData({
                symbol: ticker,
                price: quote['05. price'],
                currency: 'USD',
                marketCap: parseFloat(overview.MarketCapitalization),
                enterpriseValue: parseFloat(overview.EVToEBITDA) * parseFloat(income.ebitda),
                peRatio: parseFloat(overview.PERatio),
                forwardPE: parseFloat(overview.ForwardPE),
                pegRatio: parseFloat(overview.PEGRatio),
                priceToSales: parseFloat(overview.PriceToSalesRatioTTM),
                priceToBook: parseFloat(overview.PriceToBookRatio),
                evToRevenue: parseFloat(overview.EVToRevenue),
                evToEbitda: parseFloat(overview.EVToEBITDA),
                profitMargin: parseFloat(overview.ProfitMargin),
                revenue: parseFloat(income.totalRevenue),
                revenueGrowth: incomePreviousYear ? ((parseFloat(income.totalRevenue) - parseFloat(incomePreviousYear.totalRevenue)) / parseFloat(incomePreviousYear.totalRevenue)) : 0,
                operatingMargin: parseFloat(overview.OperatingMarginTTM),
                ebitda: parseFloat(income.ebitda),
                ebitdaMargin: parseFloat(income.ebitda) / parseFloat(income.totalRevenue),
                netIncome: parseFloat(income.netIncome),
                eps: parseFloat(overview.EPS),
                dividendYield: parseFloat(overview.DividendYield),
                payoutRatio: parseFloat(overview.PayoutRatio),
                beta: parseFloat(overview.Beta),
                sector: overview.Sector,
                industry: overview.Industry,
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
                    <Box>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={8}>
                            <Stat>
                                <StatLabel>Current Price</StatLabel>
                                <StatNumber>{getPriceString(stockData.price, stockData.currency)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Market Cap</StatLabel>
                                <StatNumber>{getMillionsString(stockData.marketCap)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Enterprise Value</StatLabel>
                                <StatNumber>{getMillionsString(stockData.enterpriseValue)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Revenue</StatLabel>
                                <StatNumber>{getMillionsString(stockData.revenue)}</StatNumber>
                                {stockData.revenueGrowth && (
                                    <StatHelpText>
                                        <StatArrow type={stockData.revenueGrowth >= 0 ? 'increase' : 'decrease'} />
                                        {getPercentageString(stockData.revenueGrowth)}
                                    </StatHelpText>
                                )}
                            </Stat>
                            <Stat>
                                <StatLabel>EBITDA</StatLabel>
                                <StatNumber>{getMillionsString(stockData.ebitda)}</StatNumber>
                                <StatHelpText>
                                    Margin: {getPercentageString(stockData.ebitdaMargin)}
                                </StatHelpText>
                            </Stat>
                            <Stat>
                                <StatLabel>Net Income</StatLabel>
                                <StatNumber>{getMillionsString(stockData.netIncome)}</StatNumber>
                                <StatHelpText>
                                    Margin: {getPercentageString(stockData.profitMargin)}
                                </StatHelpText>
                            </Stat>
                        </SimpleGrid>

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
                                        <Td>P/E Ratio</Td>
                                        <Td>{stockData.peRatio?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Forward P/E</Td>
                                        <Td>{stockData.forwardPE?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>PEG Ratio</Td>
                                        <Td>{stockData.pegRatio?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Price/Sales</Td>
                                        <Td>{stockData.priceToSales?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Price/Book</Td>
                                        <Td>{stockData.priceToBook?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>EV/Revenue</Td>
                                        <Td>{stockData.evToRevenue?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>EV/EBITDA</Td>
                                        <Td>{stockData.evToEbitda?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Operating Margin</Td>
                                        <Td>{getPercentageString(stockData.operatingMargin)}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>EPS</Td>
                                        <Td>{getPriceString(stockData.eps, stockData.currency)}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Dividend Yield</Td>
                                        <Td>{getPercentageString(stockData.dividendYield)}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Payout Ratio</Td>
                                        <Td>{getPercentageString(stockData.payoutRatio)}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Beta</Td>
                                        <Td>{stockData.beta?.toFixed(2) ?? 'N/A'}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Sector</Td>
                                        <Td>{stockData.sector}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>Industry</Td>
                                        <Td>{stockData.industry}</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </Box>
                    </Box>
                )}
            </VStack>
        </Box>
    )
}

export default StockTicker 
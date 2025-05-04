import { Container, VStack, Heading } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StockTicker from './components/StockTicker'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container maxW="container.md" py={10}>
        <VStack gap={8}>
          <Heading>Stock Information</Heading>
          <StockTicker />
        </VStack>
      </Container>
    </QueryClientProvider>
  )
}

export default App

import { Box, useBreakpointValue, ChakraProvider, ColorModeScript, useColorModeValue } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import StockTicker from './components/StockTicker'
import HistoricalTicker from './components/HistoricalTicker'
import Portfolio from './components/Portfolio'
import Watchlist from './components/Watchlist'
import theme from './theme'

const AppContent = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box
      display="flex"
      minH="100vh"
      w="100vw"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="auto"
      bg={bgColor}
    >
      <Sidebar />
      <Box
        ml={isMobile ? 0 : "250px"}
        p={4}
        flex="1"
        width="100%"
      >
        <Routes>
          <Route path="/" element={<StockTicker />} />
          <Route path="/historical" element={<HistoricalTicker />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <AppContent />
      </Router>
    </ChakraProvider>
  );
}

export default App;

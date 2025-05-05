import { Box, useBreakpointValue, ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import StockTicker from './components/StockTicker'
import Portfolio from './components/Portfolio'
import theme from './theme'

function App() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Box display="flex">
          <Sidebar />
          <Box
            ml={isMobile ? 0 : "250px"}
            p={4}
            flex="1"
            width="100%"
          >
            <Routes>
              <Route path="/" element={<StockTicker />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App

import { Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import StockTicker from './components/StockTicker'
import Portfolio from './components/Portfolio'

function App() {
  return (
    <Router>
      <Box display="flex">
        <Sidebar />
        <Box ml="200px" p={4} flex="1">
          <Routes>
            <Route path="/" element={<StockTicker />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  )
}

export default App

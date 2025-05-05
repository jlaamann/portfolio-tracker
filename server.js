import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Proxy endpoint for stock data
app.get('/api/stock/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoint for currency exchange rates
app.get('/api/currency/:from/:to', async (req, res) => {
    try {
        const { from, to } = req.params;
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${from}${to}=X?interval=1d&range=1d`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
}); 
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

// Proxy endpoint for historical stock data
app.get('/api/stock/:ticker/historical', async (req, res) => {
    try {
        const { ticker } = req.params;
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        // Convert dates to Unix timestamps (seconds)
        const startTimestamp = Math.floor(new Date(start).getTime() / 1000);
        const endTimestamp = Math.floor(new Date(end).getTime() / 1000);

        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${startTimestamp}&period2=${endTimestamp}&includePrePost=false&events=div%2Csplit`
        );
        res.json(response.data);
    } catch (error) {
        console.error('Historical data error:', error.message);
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
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"]
  }
});

// Configuration
const FINNHUB_API_KEY = 'cve6d11r01ql1jn9e8l0cve6d11r01ql1jn9e8lg';

// Middleware
app.use(cors());
app.use(express.json());

let portfolio = [];

// Real-time price endpoint
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.data || response.data.d === null) {
      throw new Error('Invalid stock data received');
    }

    io.emit('stockUpdate', { symbol, data: response.data });
    res.json(response.data);
  } catch (error) {
    console.error('Stock API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error.response?.data || error.message 
    });
  }
});

// Historical data endpoint (fixed)
app.get('/api/stock/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const from = Math.floor(Date.now() / 1000) - 2592000; // 30 days ago
    const to = Math.floor(Date.now() / 1000);
    
    const response = await axios.get(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );

    if (response.data.s !== "ok") {
      throw new Error(response.data.error || 'Invalid historical data');
    }

    res.json(response.data);
  } catch (error) {
    console.error('Historical Data Error:', error.message);
    console.error('Finnhub Response:', error.response?.data);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      details: error.response?.data || error.message
    });
  }
});

// Portfolio management
app.post('/api/portfolio', (req, res) => {
  try {
    const newItem = {
      symbol: req.body.symbol,
      quantity: req.body.quantity || 1,
      purchasePrice: req.body.purchasePrice,
      dateAdded: new Date().toISOString()
    };
    
    portfolio.push(newItem);
    res.json(portfolio);
  } catch (error) {
    console.error('Portfolio Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to update portfolio',
      details: error.message 
    });
  }
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

server.listen(5000, () => console.log('Server running on port 5000'));
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

dotenv.config();
app.use(cors());
app.use(express.json());

let portfolio = [];

// Fetch stock price
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Add to portfolio
app.post('/api/portfolio', (req, res) => {
  const { symbol, quantity } = req.body;
  portfolio.push({ symbol, quantity });
  res.json(portfolio);
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(5000, () => console.log(`Server running on port 5000`));
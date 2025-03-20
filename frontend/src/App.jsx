import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from './components/StockChart';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const App = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    socket.on('stockUpdate', (data) => {
      console.log('Stock update:', data);
      setStockData(data);
    });
  }, []);

  const fetchStock = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/stock/${symbol}`);
      setStockData(response.data);
    } catch (error) {
      console.error('Failed to fetch stock data', error);
    }
  };

  const addToPortfolio = () => {
    axios.post('http://localhost:5000/api/portfolio', { symbol, quantity: 1 })
      .then(res => setPortfolio(res.data))
      .catch(error => console.error('Failed to add to portfolio', error));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Stock Dashboard</h1>
      <input
        type="text"
        placeholder="Enter stock symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <button onClick={fetchStock}>Search</button>
      {stockData && (
        <div>
          <h2>{symbol}</h2>
          <p>Price: ${stockData.c}</p>
          <button onClick={addToPortfolio}>Add to Portfolio</button>
          <StockChart symbol={symbol} data={[stockData]} />
        </div>
      )}
      <h2>Portfolio</h2>
      <ul>
        {portfolio.map((item, index) => (
          <li key={index}>{item.symbol} - {item.quantity} shares</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
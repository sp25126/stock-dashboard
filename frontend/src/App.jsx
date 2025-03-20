import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import StockChart from './components/StockChart';
import './index.css';

const stockList = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 
  'META', 'NVDA', 'NFLX', 'DIS', 'V'
];

const socket = io('http://localhost:5000');

const App = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time updates
  useEffect(() => {
    socket.on('stockUpdate', ({ symbol, data }) => {
      setPrices(prev => ({ ...prev, [symbol]: data }));
      if(symbol === symbol) setStockData(data);
    });

    return () => socket.disconnect();
  }, []);

  const fetchStock = async () => {
    if(!symbol) return;
    setLoading(true);
    try {
      const [quote, history] = await Promise.all([
        axios.get(`http://localhost:5000/api/stock/${symbol}`),
        axios.get(`http://localhost:5000/api/stock/historical/${symbol}`)
      ]);
      setStockData(quote.data);
      setHistory(history.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data. Check symbol or try later.');
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/portfolio', {
        symbol,
        quantity: 1,
        purchasePrice: stockData.c
      });
      setPortfolio(res.data);
    } catch (err) {
      setError('Failed to add to portfolio');
    }
  };

  const totalValue = portfolio.reduce((sum, item) => 
    sum + (prices[item.symbol]?.c || 0) * item.quantity, 0
  );

  const profitLoss = portfolio.map(item => ({
    ...item,
    pl: ((prices[item.symbol]?.c || 0) - item.purchasePrice) * item.quantity
  }));

  return (
    <div className="gradient-background">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Stock Dashboard</h1>

        {/* Search Section */}
        <div className="glass-card">
          <div className="card-controls">
            <span className="control-dot red" />
            <span className="control-dot yellow" />
            <span className="control-dot green" />
          </div>
          
          <div className="search-section">
            <div className="search-group">
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && fetchStock()}
                placeholder="Enter symbol (AAPL)"
                list="stocks"
                className="search-input"
              />
              <datalist id="stocks">
                {stockList.map(s => <option key={s} value={s} />)}
              </datalist>
              <button 
                onClick={fetchStock} 
                disabled={loading}
                className="search-button"
              >
                {loading ? '⌛' : '🔍'}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}

            {stockData && (
              <div className="stock-display">
                <h2>{symbol}</h2>
                <p>Current: ${stockData.c?.toFixed(2)}</p>
                <button onClick={addToPortfolio} className="add-button">
                  ➕ Add to Portfolio
                </button>
                <StockChart data={history} />
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="glass-card">
          <div className="card-controls">
            <span className="control-dot red" />
            <span className="control-dot yellow" />
            <span className="control-dot green" />
          </div>
          <h3>Portfolio Value: ${totalValue.toFixed(2)}</h3>
        </div>

        {/* Holdings */}
        <div className="glass-card">
          <div className="card-controls">
            <span className="control-dot red" />
            <span className="control-dot yellow" />
            <span className="control-dot green" />
          </div>
          <div className="holdings-list">
            {profitLoss.map((item, i) => (
              <div key={i} className="holding-item">
                <div>
                  <span className="stock-symbol">{item.symbol}</span>
                  <span className="stock-quantity">{item.quantity} shares</span>
                </div>
                <span className={`pl-value ${item.pl >= 0 ? 'positive' : 'negative'}`}>
                  ${item.pl.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
import axios from 'axios';
import yahooFinance from 'yahoo-finance2';

// Primary API: Finnhub
const fetchStockDataFinnhub = async (symbol) => {
  const API_KEY = 'your_finnhub_api_key'; // Replace with your Finnhub API key
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

// Fallback API: Yahoo Finance
const fetchStockDataYahoo = async (symbol) => {
  const result = await yahooFinance.quote(symbol);
  return {
    c: result.regularMarketPrice, // Current price
    h: result.regularMarketDayHigh, // High price
    l: result.regularMarketDayLow, // Low price
    o: result.regularMarketOpen, // Open price
    pc: result.regularMarketPreviousClose, // Previous close price
  };
};

// Combined function with fallback
export const fetchStockData = async (symbol) => {
  try {
    // Try Finnhub first
    const data = await fetchStockDataFinnhub(symbol);
    return data;
  } catch (error) {
    console.error('Finnhub API failed, trying Yahoo Finance...', error);
    try {
      // Fallback to Yahoo Finance
      const data = await fetchStockDataYahoo(symbol);
      return data;
    } catch (fallbackError) {
      console.error('Yahoo Finance API also failed:', fallbackError);
      throw new Error('Both APIs failed to fetch stock data.');
    }
  }
};
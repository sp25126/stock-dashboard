import React from 'react';
import Chart from 'react-apexcharts';

const StockChart = ({ symbol, data }) => {
  const options = {
    chart: {
      type: 'candlestick',
    },
    title: {
      text: `${symbol} Stock Price`,
      align: 'left',
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  const series = [
    {
      data: data.map((item) => ({
        x: new Date(item.t * 1000), // Convert timestamp to date
        y: [item.o, item.h, item.l, item.c], // Open, High, Low, Close
      })),
    },
  ];

  return <Chart options={options} series={series} type="candlestick" height={350} />;
};

export default StockChart;
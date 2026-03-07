import type { ChartData } from 'chart.js';

const getRandomRgbColor = (): string => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return `rgb(${r}, ${g}, ${b})`;
};

export const createDataSet = (values: number[]): ChartData['datasets'] => {
  return [
    {
      data: values,
      backgroundColor: values.map(getRandomRgbColor),
    },
  ];
};

const data = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [],
    },
  ],
};

const config = {
  type: 'bar',
  data,
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      y: {
        title: {
          text: 'Number of purchases',
          display: true,
        },
      }
    }
  }
};

export default config;

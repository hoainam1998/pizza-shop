import { whiteColor } from '@/assets/scss/variables.module.scss';

const createRandomDataset = (length: number) => {
  return Array.apply(this, Array(length)).map(() => Math.ceil(Math.random() * 10));
};

const labels = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const data = {
  labels,
  datasets: [
    {
      data: createRandomDataset(16),
      pointBorderWidth: 2,
      pointRadius: 5,
      pointBackgroundColor: whiteColor,
    },
  ],
};

export default {
  type: 'line',
  data,
  options: {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            return `${context[0].label}h`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (_: any, index: number) => `${labels[index]}h`,
        },
        title: {
          text: 'Hours',
          display: true,
          font: {
            weight: 'bold',
          },
        },
      },
      y: {
        title: {
          text: 'Number of purchases',
          display: true,
          font: {
            weight: 'bold',
          },
        },
      },
    },
  },
};

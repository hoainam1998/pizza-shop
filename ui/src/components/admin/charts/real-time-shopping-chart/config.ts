import {
  bottomChartColor,
  topChartColor,
} from '@/assets/scss/variables.module.scss';

const labels = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const data = {
  labels,
  datasets: [
    {
      label: 'Capital',
      backgroundColor: bottomChartColor,
    },
    {
      label: 'Revenue',
      backgroundColor: topChartColor,
    },
  ],
};

export default {
  type: 'bar',
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
        stacked: true,
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
        stacked: true,
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

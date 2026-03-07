import {
  bottomChartColor,
  topChartColor,
  whiteColor,
  capitalBorderColor,
  revenueLineColor,
} from '@/assets/scss/variables.module.scss';
import { formatVNDCurrency } from '@/utils';

const commonLineChartConfig = {
  type: 'line',
  fill: false,
  backgroundColor: whiteColor,
  pointBorderWidth: 2,
  pointRadius: 5,
};

const data = {
  labels: [],
  datasets: [
    {
      label: 'Capital',
      borderColor: capitalBorderColor,
      pointBorderColor: capitalBorderColor,
      ...commonLineChartConfig,
    },
    {
      label: 'Revenue',
      borderColor: revenueLineColor,
      pointBorderColor: revenueLineColor,
      ...commonLineChartConfig,
    },
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
const config = {
  type: 'bar',
  data: data,
  options: {
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        onClick: null,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return ` ${context.dataset.label}: ${formatVNDCurrency(context.raw)}`;
          },
          labelColor: function (context: any) {
            return {
              borderColor: context.element.options.borderColor,
              backgroundColor: context.element.options.backgroundColor,
              borderWidth: 2,
            };
          },
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
        title: {
          text: 'Hour',
          display: true,
          font: {
            weight: 'bold',
          },
        },
      },
      y: {
        stacked: true,
        ticks: {
          callback: (value: number) => formatVNDCurrency(value),
        },
        title: {
          text: 'VND',
          display: true,
          font: {
            weight: 'bold',
          },
        },
      },
    },
  },
};

export default config;

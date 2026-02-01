import {
  bottomChartColor,
  middleChartColor,
  topChartColor,
  whiteColor,
  capitalBorderColor,
  profitLineColor,
  revenueLineColor,
} from '@/assets/scss/variables.module.scss';
import { formatVNDCurrency } from '@/utils';

const data = {
  labels: [],
  datasets: [
    {
      type: 'line',
      label: 'Capital',
      fill: false,
      borderColor: capitalBorderColor,
      backgroundColor: whiteColor,
      pointBorderColor: capitalBorderColor,
      pointBorderWidth: 2,
      pointRadius: 5,
    },
    {
      type: 'line',
      label: 'Profit',
      fill: false,
      borderColor: revenueLineColor,
      backgroundColor: whiteColor,
      pointBorderColor: revenueLineColor,
      pointBorderWidth: 2,
      pointRadius: 5,
    },
    {
      type: 'line',
      label: 'Revenue',
      fill: false,
      borderColor: profitLineColor,
      backgroundColor: whiteColor,
      pointBorderColor: profitLineColor,
      pointBorderWidth: 2,
      pointRadius: 5,
    },
    {
      label: 'Capital',
      backgroundColor: bottomChartColor,
    },
    {
      label: 'Profit',
      backgroundColor: middleChartColor,
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

<template>
  <section class="line-stacked-bar-mixed-chart">
    <ChartControl v-model:mode="chartPayload.by" v-model:time="chartPayload.time" @load="loadChartData" />
    <div :style="chartSize">
      <canvas ref="revenue-chart" />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { onMounted, useTemplateRef, onBeforeUnmount, reactive } from 'vue';
import ChartControl from '../chart-control/chart-control.vue';
import Chart from 'chart.js/auto';
import { ChartMode } from '@/enums';
import type { SizeChartType } from '@/interfaces';
import config from './config';
import { useSizeChart } from '@/composables';

const size = defineProps<SizeChartType>();
const chartSize = useSizeChart(size);
const ctx = useTemplateRef('revenue-chart');
let chart: Chart | null = null;
const defaultDate = new Date();
defaultDate.setHours(0, 0, 0, 0);

const chartPayload = reactive({
  by: ChartMode.HOUR,
  time: defaultDate.getTime(),
});

const targetTime = reactive({
  type: 'date',
  placeholder: 'Pick a date!',
});

const createRandomDataset = (length: number) => {
  return Array.apply(this, Array(length)).map(() => Math.ceil(Math.random() * 10));
};

const generatorDummyDataChart = (mode: ChartMode = ChartMode.HOUR) => {
  switch (mode) {
    case ChartMode.DAY: {
      return {
        labels() {
          return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
          17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
        },
        capital() {
          return createRandomDataset(this.labels().length);
        },
        profit() {
          return createRandomDataset(this.labels().length);
        },
        revenue() {
          return createRandomDataset(this.labels().length);
        }
      };
    };
    case ChartMode.MONTH: {
      return {
        labels() {
          return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        },
        capital() {
          return createRandomDataset(this.labels().length);
        },
        profit() {
          return createRandomDataset(this.labels().length);
        },
        revenue() {
          return createRandomDataset(this.labels().length);
        }
      };
    };
    case ChartMode.QUARTER: {
      return {
        labels() {
          return [1, 2, 3, 4];
        },
        capital() {
          return createRandomDataset(this.labels().length);
        },
        profit() {
          return createRandomDataset(this.labels().length);
        },
        revenue() {
          return createRandomDataset(this.labels().length);
        }
      };
    };
    case ChartMode.YEAR: {
      return {
        labels() {
          return [2025, 2026];
        },
        capital() {
          return createRandomDataset(this.labels().length);
        },
        profit() {
          return createRandomDataset(this.labels().length);
        },
        revenue() {
          return createRandomDataset(this.labels().length);
        }
      };
    }
    default:
      return {
        labels() {
          return [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((hour) => `${hour}h`);
        },
        capital() {
          return createRandomDataset(this.labels().length);
        },
        profit() {
          return createRandomDataset(this.labels().length);
        },
        revenue() {
          return createRandomDataset(this.labels().length);
        }
      };
  }
};

const chartUpdate = (mode: ChartMode = ChartMode.HOUR): void => {
  switch (mode) {
    case ChartMode.DAY: {
      targetTime.placeholder = 'Pick a month!';
      targetTime.type = 'month';
      break;
    };
    case ChartMode.MONTH:
    case ChartMode.QUARTER:
      {
        targetTime.placeholder = 'Pick a year!';
        targetTime.type = 'year';
        break;
      };
    default: {
      targetTime.placeholder = 'Pick a date!';
      targetTime.type = 'date';
      break;
    }
  }

  if (chart) {
    const data = generatorDummyDataChart(mode);
    (chart.options as any).scales.x.title.text = `${mode}s`.toUpperCase();
    chart.data.labels = data?.labels() || [];
    const capital = data?.capital() || [];
    const profit = data?.profit() || [];
    const revenue = data?.revenue() || [];
    chart.data.datasets[0].data = capital;
    chart.data.datasets[1].data = profit;
    chart.data.datasets[2].data = revenue;
    chart.data.datasets[3].data = capital;
    chart.data.datasets[4].data = profit;
    chart.data.datasets[5].data = revenue;
    chart.update();
  }
};

const loadChartData = (): void => {
  console.log(chartPayload);
};

onMounted(() => {
  loadChartData();
  if (!chart) {
    chart = new Chart(ctx.value!, config as any);
    chartUpdate();
  }
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>

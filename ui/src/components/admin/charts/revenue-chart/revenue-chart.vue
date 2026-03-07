<template>
  <section class="line-stacked-bar-mixed-chart">
    <ChartControl
      v-model:mode="chartPayload.by"
      v-model:time="chartPayload.time"
      :calendarType="calendarType"
      @load="loadChartData"
      @showDatePicker="showDatePicker" />
    <div :style="chartSize">
      <canvas ref="revenue-chart" />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { onMounted, useTemplateRef, onBeforeUnmount, reactive, ref } from 'vue';
import ChartControl from '../chart-control/chart-control.vue';
import Chart from 'chart.js/auto';
import { ChartMode } from '@/enums';
import config from './config';
import chartPropsValidator from '../props-validator';
import { useSizeChart } from '@/composables';
import { ProductService } from '@/services';

const size = defineProps(chartPropsValidator);
const calendarType = ref<string>('date');
const chartSize = useSizeChart(size);
const ctx = useTemplateRef('revenue-chart');
let chart: Chart | null = null;
const defaultDate = new Date();
defaultDate.setHours(0, 0, 0, 0);

const chartPayload = reactive({
  by: ChartMode.DAY,
  time: defaultDate.getTime(),
});

const showDatePicker = (type: string): void => {
    switch (type) {
    case ChartMode.DAY:
      calendarType.value = 'date';
      break;
    case ChartMode.MONTH:
      calendarType.value = 'month';
      break;
    case ChartMode.QUARTER:
    case ChartMode.YEAR:
      calendarType.value = 'year';
      break;
    default: break;
  }
};

const renderXTitle = (mode: string): string => {
  switch (mode) {
    case ChartMode.DAY:
      return 'Hours in a day.';
    case ChartMode.MONTH:
      return 'Days in a month.';
    case ChartMode.QUARTER:
      return 'Quarters in a year.';
    case ChartMode.YEAR:
      return 'Months in a year.';
    default: return '';
  }
};

const chartUpdate = (mode: ChartMode = ChartMode.DAY): void => {
  if (chart) {
    (chart.options as any).scales.x.title.text = renderXTitle(mode);
    ProductService.post('load-data-revenue-chart', chartPayload)
      .then((response) => {
        chart!.data.labels = response.data.labels;
        chart!.data.datasets[0].data = response.data.capital;
        chart!.data.datasets[1].data = response.data.revenue;
        chart!.data.datasets[2].data = response.data.capital;
        chart!.data.datasets[3].data = response.data.revenue;
        chart!.update();
      });
  }
};

const loadChartData = (): void => {
  chartUpdate(chartPayload.by);
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

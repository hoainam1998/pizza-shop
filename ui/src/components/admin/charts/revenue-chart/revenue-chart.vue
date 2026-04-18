<template>
  <section class="line-stacked-bar-mixed-chart">
    <ChartControl
      v-model:mode="chartPayload.by"
      v-model:time="chartPayload.time"
      :calendarType="calendarType"
      @load="chartUpdate"
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
import { CHART_MODE } from '@/enums';
import config from './config';
import chartPropsValidator from '@/components/admin/charts/types';
import { useSizeChart } from '@/composables';
import type { RevenueChartPropsType, ChartPayloadType } from '@/interfaces';

const size = defineProps(chartPropsValidator);
const calendarType = ref<string>('date');
const chartSize = useSizeChart(size);
const ctx = useTemplateRef('revenue-chart');
let chart: Chart | null = null;
const defaultDate = new Date();
defaultDate.setHours(0, 0, 0, 0);

const chartPayload = reactive<ChartPayloadType>({
  by: CHART_MODE.DAY,
  time: defaultDate.getTime(),
});

const emit = defineEmits<{
  (e: 'onLoad', payload: ChartPayloadType): void;
}>();

const showDatePicker = (type: string): void => {
    switch (type) {
    case CHART_MODE.DAY:
      calendarType.value = 'date';
      break;
    case CHART_MODE.MONTH:
      calendarType.value = 'month';
      break;
    case CHART_MODE.QUARTER:
    case CHART_MODE.YEAR:
      calendarType.value = 'year';
      break;
    default: break;
  }
};

const renderXTitle = (mode: string): string => {
  switch (mode) {
    case CHART_MODE.DAY:
      return 'Hours in a day.';
    case CHART_MODE.MONTH:
      return 'Days in a month.';
    case CHART_MODE.QUARTER:
      return 'Quarters in a year.';
    case CHART_MODE.YEAR:
      return 'Months in a year.';
    default: return '';
  }
};

const onLoadingComplete = (data?: RevenueChartPropsType): void => {
  if (chart) {
    if (data) {
      chart!.data.labels = data.labels;
      chart!.data.datasets[0].data = data.capital;
      chart!.data.datasets[1].data = data.revenue;
      chart!.data.datasets[2].data = data.capital;
      chart!.data.datasets[3].data = data.revenue;
    } else {
      chart!.data.labels = [];
      chart!.data.datasets[0].data = [];
      chart!.data.datasets[1].data = [];
      chart!.data.datasets[2].data = [];
      chart!.data.datasets[3].data = [];
    }
    chart!.update();
  }
};

const chartUpdate = (): void => {
  if (chart) {
    (chart.options as any).scales.x.title.text = renderXTitle(chartPayload.by);
    emit('onLoad', chartPayload);
  }
};

defineExpose({
  onLoadingComplete,
});

onMounted(() => {
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

<template>
  <section class="best-selling-products-chart">
    <ChartControl v-model:mode="chartPayload.by" v-model:time="chartPayload.time" @load="loadChartData" />
    <div :style="chartSize">
      <canvas ref="best-selling-products-chart" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount, reactive } from 'vue';
import ChartControl from '../chart-control/chart-control.vue';
import Chart from 'chart.js/auto';
import { ChartMode } from '@/enums';
import config from './config';
import { useSizeChart } from '@/composables';
import chartPropsValidator from '../props-validator';

const size = defineProps(chartPropsValidator);
const chartSize = useSizeChart(size);
let chart: Chart | null = null;
const ctx = useTemplateRef('best-selling-products-chart');
const defaultDate = new Date();
defaultDate.setHours(0, 0, 0, 0);

const chartPayload = reactive({
  by: ChartMode.HOUR,
  time: defaultDate.getTime(),
});

const loadChartData = (): void => {
  console.log(chartPayload);
};

onMounted(() => {
  if (!chart) {
    chart = new Chart(ctx.value!, config as any);
  }
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>

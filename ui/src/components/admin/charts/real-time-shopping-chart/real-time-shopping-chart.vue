<template>
  <section class="real-time-shopping-chart" :style="chartSize">
    <canvas ref="shopping-chart" />
  </section>
</template>
<script setup lang="ts">
import { onMounted, useTemplateRef, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';
import config from './config';
import { useSizeChart } from '@/composables';
import chartPropsValidator from '../props-validator';

const size = defineProps(chartPropsValidator);
const chartSize = useSizeChart(size);
const ctx = useTemplateRef('shopping-chart');
let chart: Chart | null = null;

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

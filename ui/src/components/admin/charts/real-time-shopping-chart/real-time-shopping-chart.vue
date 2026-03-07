<template>
  <section class="real-time-shopping-chart" :style="chartSize">
    <span class="ps-float-right ps-clear-both ps-mr-20 ps-fs-14">
      <span class="ps-fw-bold">Target date:</span> {{ $formatDateHyphen(Date.now()) }}
    </span>
    <canvas ref="shopping-chart" />
  </section>
</template>
<script setup lang="ts">
import { onMounted, useTemplateRef, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';
import config from './config';
import { useSizeChart } from '@/composables';
import chartPropsValidator from '../props-validator';
import { type RealTimeShoppingChartPropsType } from '@/interfaces';

const { height, width } = defineProps(chartPropsValidator);
const emit = defineEmits<{
  (e: 'onLoad', callback: typeof onLoadingComplete): void;
}>();
const chartSize = useSizeChart({ height, width });
const ctx = useTemplateRef('shopping-chart');
let chart: Chart | null = null;

const onLoadingComplete = (data: RealTimeShoppingChartPropsType | null): void => {
  if (chart) {
    if (data) {
      chart!.data.datasets[0].data = data!.revenue;
      chart!.data.datasets[1].data = data!.capital;
    } else {
      chart!.data.datasets[0].data = [];
      chart!.data.datasets[1].data = [];
    }
    chart!.update();
  }
};

const addDataChart = (payload: any): void => {
  if (chart) {
    chart!.data.datasets[0].data.push(payload.revenue);
    chart!.data.datasets[1].data.push(payload.capital);
    chart!.update();
  }
};

defineExpose({
  addDataChart,
});

onMounted(() => {
  if (!chart) {
    chart = new Chart(ctx.value!, config as any);
  }
  emit('onLoad', onLoadingComplete);
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>

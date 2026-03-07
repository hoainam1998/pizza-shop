<template>
  <section class="best-selling-products-chart">
    <ChartControl
      v-model:mode="chartPayload.by"
      v-model:time="chartPayload.time"
      :calendarType="calendarType"
      @load="loadChartData"
      @showDatePicker="showDatePicker">
        <el-select v-if="showQuarterSelect"
          v-model="quarter"
          class="ps-w-170px"
          placeholder="Select a quarter!"
          @change="onQuarterChange">
            <el-option label="Quarter 1" :value="1" />
            <el-option label="Quarter 2" :value="2" />
            <el-option label="Quarter 3" :value="3" />
            <el-option label="Quarter 4" :value="4" />
        </el-select>
    </ChartControl>
    <div :style="chartSize">
      <canvas ref="best-selling-products-chart" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue';
import ChartControl from '../chart-control/chart-control.vue';
import Chart from 'chart.js/auto';
import { ChartMode } from '@/enums';
import config, { createDataSet } from './config';
import { useSizeChart } from '@/composables';
import chartPropsValidator from '../props-validator';
import type { BestSellingProductsChartPropsType, ChartPayloadType } from '@/interfaces';

const size = defineProps(chartPropsValidator);
const calendarType = ref<string>('date');
const showQuarterSelect = ref<boolean>(false);
const quarter = ref<number>(1);
const emit = defineEmits<{
  (e: 'onLoad', payload: ChartPayloadType, callback: typeof onLoadingComplete): void;
}>();
const chartSize = useSizeChart(size);
let chart: Chart | null = null;
const ctx = useTemplateRef('best-selling-products-chart');
const defaultDate = new Date();
defaultDate.setHours(0, 0, 0, 0);

const startMonthOfQuarter: Record<number, number> = {
  1: 0,
  2: 3,
  3: 6,
  4: 9,
};

const chartPayload = reactive({
  by: ChartMode.DAY,
  time: defaultDate.getTime(),
});

watch(() => chartPayload.by, () => {
  if (chartPayload.by == ChartMode.QUARTER) {
    showQuarterSelect.value = true;
  } else {
    showQuarterSelect.value = false;
  }
});

const onQuarterChange = (quarter: number): void => {
  const date = new Date(chartPayload.time);
  date.setMonth(startMonthOfQuarter[quarter]);
  chartPayload.time = date.getTime();
  loadChartData();
};

const onLoadingComplete = (data: BestSellingProductsChartPropsType | null): void => {
  if (chart) {
    if (data) {
      chart.data.datasets = createDataSet(data.values);
      chart.data.labels = data.labels;
    } else {
      chart.data.datasets = [];
      chart.data.labels = [];
    }
    chart.update();
  }
};

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

const loadChartData = (): void => {
  emit('onLoad', chartPayload, onLoadingComplete);
};

onMounted(() => {
  if (!chart) {
    chart = new Chart(ctx.value!, config as any);
  }
  loadChartData();
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>

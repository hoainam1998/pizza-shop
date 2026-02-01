<template>
  <div class="ps-display-flex ps-flex-gap-7 ps-align-items-center ps-my-10 ps-px-10">
    <p class="ps-fs-14 ps-text-color-606266">Load data chart by:</p>
    <el-select v-model="mode" class="ps-w-150px" @change="loadChartData">
      <List :items="options">
        <template #default="{ item }">
          <el-option :label="item" :value="item" />
        </template>
      </List>
    </el-select>
    <el-date-picker
    v-if="mode !== ChartMode.YEAR"
    v-model="time"
    :type="targetTime.type"
    :placeholder="targetTime.placeholder"
    value-format="x"
    :editable="false"
    :disabled-date="dateDisabled"
    class="ps-w-180px"
    @clear="clear"
    @change="loadChartData" />
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
import List from '@/components/common/list.vue';
import { ChartMode } from '@/enums';

const mode = defineModel('mode', { default: ChartMode.HOUR });
const time = defineModel('time');
const establishDay = Date.now();
const defaultDate = new Date();
defaultDate.setHours(0, 0, 0, 0);
const targetTime = reactive({
  type: 'date',
  placeholder: 'Pick a date!',
});

const emit = defineEmits<{
  (e: 'load'): Promise<any>,
}>();

const clear = (): void => {
  time.value = defaultDate.getTime();
  emit('load');
};

const options = Object.values(ChartMode);

const dateDisabled = (date: Date): boolean => {
  const establishDayLocal = new Date(establishDay);
  establishDayLocal.setHours(0, 0, 0, 0);
  return date.getTime() < establishDayLocal.getTime();
};

const loadChartData = (value: number | null): void => {
  if (value) {
    emit('load');
  }
};
</script>

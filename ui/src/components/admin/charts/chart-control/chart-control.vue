<template>
  <div class="ps-display-flex ps-flex-gap-7 ps-align-items-center ps-my-10 ps-px-10">
    <p class="ps-fs-14 ps-text-color-606266">Load data chart by:</p>
    <el-select v-model="mode" class="ps-w-150px" @change="loadDatePickerType">
      <List :items="options">
        <template #default="{ item }">
          <el-option :label="item" :value="item" />
        </template>
      </List>
    </el-select>
    <slot />
    <el-date-picker
      v-if="showYearPicker"
      v-model="time"
      :type="calendarType"
      value-format="x"
      :editable="false"
      class="ps-w-180px"
      @clear="clear"
      @change="loadChartData" />
  </div>
</template>
<script setup lang="ts">
import List from '@/components/common/list.vue';
import { CHART_MODE } from '@/enums';

const mode = defineModel('mode', { default: CHART_MODE.DAY });
const time = defineModel('time');
const { calendarType, showYearPicker = true } = defineProps<{
  calendarType: string,
  showYearPicker?: boolean,
}>();
const defaultDate = new Date();
defaultDate.setHours(0, 0, 0, 0);

const emit = defineEmits<{
  (e: 'load'): Promise<any>,
  (e: 'showDatePicker', type: string): Promise<any>,
}>();

const options = Object.values(CHART_MODE);

const loadDatePickerType = (type: string): void => {
  emit('showDatePicker', type);
  loadChartData();
};

const clear = (): void => {
  time.value = defaultDate.getTime();
  emit('load');
};

const loadChartData = (): void => {
  if (time.value) {
    emit('load');
  }
};
</script>

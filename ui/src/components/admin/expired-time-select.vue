<template>
  <div class="expired-time-select">
    <el-date-picker
      v-model="selectedDay"
      type="date"
      :name="name"
      placeholder="Pick a expired day!"
      :disabled-date="disabledDate"
      :shortcuts="shortcuts"
      value-format="x"
      size="default" />
  </div>
</template>

<script lang="ts" setup>
type ExpiredDaySelectProps = {
  name: string;
};

type DatePickerShortcut = {
  text: string;
  value: (time: any) => Date;
};

const selectedDay = defineModel();
const { name } = defineProps<ExpiredDaySelectProps>();
const disabledDate = (time: Date): boolean => time.getTime() < Date.now();
const oneDay: number = 3600 * 1000 * 24;

const shortcuts: DatePickerShortcut[] = [
  {
    text: 'Tomorrow',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() + oneDay);
      return date;
    },
  },
  {
    text: 'A week later',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() + oneDay * 7);
      return date;
    },
  },
  {
    text: '15th days later',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() + oneDay * 15);
      return date;
    },
  },
  {
    text: '30th days later',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() + oneDay * 30);
      return date;
    },
  },
  {
    text: '3th months later',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() + oneDay * 30 * 3);
      return date;
    },
  },
  {
    text: '6th months later',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() + oneDay * 30 * 6);
      return date;
    },
  },
];
</script>
<style lang="scss">
  .expired-time-select {
    flex-basis: 100%;
  }
</style>

<template>
  <section class="ps-display-flex ps-justify-content-center ps-align-items-center ps-h-100">
    <div class="ps-bg-f39c12 ps-border-radius-5">
      <h4 class="ps-text-color-white ps-text-transform-uppercase ps-py-3 ps-px-7">{{ title }}</h4>
      <div class="box ps-w-400px ps-border-radius-5 ps-bg-white ps-px-10 ps-py-10">
        <slot />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { defineProps } from 'vue';
type LoginFramePropsType = {
  title: string;
};

const { title } = defineProps<LoginFramePropsType>();
</script>
<style lang="scss" scoped>
  .box {
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }
</style>

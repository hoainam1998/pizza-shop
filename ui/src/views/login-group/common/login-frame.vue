<template>
  <section class="ps-display-flex ps-justify-content-center ps-align-items-center ps-h-100">
    <div class="ps-bg-f39c12 ps-border-radius-5">
      <h4 class="ps-text-color-white ps-text-transform-uppercase ps-py-3 ps-px-7">{{ title }}</h4>
      <div class="box ps-box-shadow-3 ps-w-400px ps-border-radius-5 ps-bg-white ps-px-10 ps-py-10">
        <slot />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
type LoginFramePropsType = {
  title: string;
};

const { title } = defineProps<LoginFramePropsType>();
</script>

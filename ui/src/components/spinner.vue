<template>
  <section v-loading="shouldLoading" class="spinner ps-w-100vw ps-h-100vh">
    <slot />
  </section>
</template>

<script setup lang="ts">
import useLoadingStore from '@/composables/store/loading';

const loadingStore = useLoadingStore();
const shouldLoading = loadingStore.state.loading;
</script>
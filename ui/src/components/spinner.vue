<template>
  <section v-loading="loadingStore.loading" class="spinner ps-w-100vw ps-h-100vh">
    <slot />
  </section>
</template>

<script setup lang="ts">
import loadingStore from '@/composables/store/loading';
</script>

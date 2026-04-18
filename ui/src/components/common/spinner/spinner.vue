<template>
  <section v-loading.fullscreen.lock="loadingStore.loading" class="spinner">
    <slot />
  </section>
</template>

<script setup lang="ts">
import loadingStore from '@/store/loading';
</script>

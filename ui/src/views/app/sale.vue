<template>
  <section class="ps-bg-ecf0f1 ps-h-100vh">
    <div class="content ps-mx-pc-15">
      <Header />
      <router-view />
    </div>
  </section>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from '@/components/sale/header.vue';
</script>
<style lang="scss" scoped>
.content {
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}
</style>

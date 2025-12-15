<template>
  <section class="ps-bg-ecf0f1 ps-h-100vh">
    <div class="content ps-box-shadow-2 ps-mx-desktop-pc-15 ps-mx-large-tablet-pc-8 ps-mx-mobile-0">
      <Header />
      <router-view />
    </div>
  </section>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from '@/components/sale/header.vue';
</script>

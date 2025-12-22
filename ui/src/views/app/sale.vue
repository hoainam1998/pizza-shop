<template>
  <section class="ps-bg-ecf0f1 ps-position-absolute ps-min-h-100vh">
    <div class="content
      ps-position-relative
      ps-box-shadow-2
      ps-w-desktop-70
      ps-w-large-tablet-85
      ps-mx-mobile-0
      ps-margin-auto">
        <Header />
        <router-view />
    </div>
  </section>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from '@/components/sale/header.vue';
</script>

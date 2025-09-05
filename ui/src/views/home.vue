<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menu from '@/components/menu.vue';
import Breadcrumb from '@/components/breadcrumb.vue';
</script>

<template>
  <div class="ps-display-flex ps-flex-gap-7">
    <Menu />
    <div class="ps-w-100">
      <Breadcrumb />
      <RouterView />
    </div>
  </div>
</template>

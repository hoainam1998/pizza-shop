<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menu from '@/components/menu.vue';
import Breadcrumb from '@/components/breadcrumb.vue';
</script>

<template>
  <div class="my-display-flex my-flex-gap-7">
    <Menu />
    <div class="my-w-100">
      <Breadcrumb />
      <RouterView />
    </div>
  </div>
</template>

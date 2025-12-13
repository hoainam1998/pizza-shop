<template>
  <Spinner>
    <router-view />
  </Spinner>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import Spinner from '@/components/spinner.vue';
</script>

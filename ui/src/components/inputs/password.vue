<template>
  <el-input v-model="model" type="password" show-password autocomplete="off" />
</template>
<script setup lang="ts">
import { defineModel } from 'vue';

const model = defineModel();
</script>

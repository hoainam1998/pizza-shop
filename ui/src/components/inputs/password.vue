<template>
  <el-input v-model="model" v-bind="attrs" />
</template>
<script setup lang="ts">
import { defineModel, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false
});
const attrsFallThrough = useAttrs();
const attrs = Object.assign({ ...attrsFallThrough }, { type: 'password', showPassword: true, autocomplete: 'off' });

const model = defineModel();
</script>

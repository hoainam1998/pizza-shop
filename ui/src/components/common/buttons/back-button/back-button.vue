<template>
  <el-button type="primary" plain class="ps-mb-10" @click="backToHome">
    <el-icon :size="20">
      <Back />
    </el-icon>
    &nbsp;&nbsp;<slot>Back</slot>
  </el-button>
</template>
<script setup lang="ts">
import { Back } from '@element-plus/icons-vue';
import useWrapperRouter from '@/composables/use-router';
import { currentRoute as currentRouteStorage } from '@/composables/store';
import paths from '@/router/paths';
const { push } = useWrapperRouter();

const path = currentRouteStorage.getCurrentRoute() || paths.BASE.Path;

const backToHome = () => push(path);
</script>

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
import paths from '@/router/paths';

const { push } = useWrapperRouter();
const path = isSale ? paths.HOME.Path : `${paths.HOME.Path}/${paths.HOME.CATEGORY.Path}`;
const backToHome = () => push(path);
</script>

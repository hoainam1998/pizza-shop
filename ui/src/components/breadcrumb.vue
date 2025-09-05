<template>
  <el-breadcrumb :separator-icon="separatorIcon" class="breadcrumb ps-py-5 ps-px-5 ps-bg-f39c12">
    <el-breadcrumb-item
      v-for="(match, index) in matched"
      :class="{ 'ps-text-color-white ps-fw-bold': index === matched.length - 1 }"
      :key="index"
      :to="{ path: match.path }"
    >
      {{ match.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import { ref, watch, h } from 'vue';
import { ArrowRightBold } from '@element-plus/icons-vue';
import { whiteColor } from '@/assets/scss/variables.module.scss';
import { useRoute } from 'vue-router';

const separatorIcon = h(ArrowRightBold, { color: whiteColor });
const route = useRoute();
const matched = ref(route.matched);

watch(route, (_, newRoute): void => {
  matched.value = newRoute.matched;
});
</script>

<style lang="scss" scoped></style>

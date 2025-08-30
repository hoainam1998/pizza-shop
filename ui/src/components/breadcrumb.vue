<template>
  <el-breadcrumb :separator-icon="separatorIcon" class="breadcrumb my-py-5 my-px-5 my-bg-f39c12">
    <el-breadcrumb-item
      v-for="(match, index) in matched"
      :class="{ 'my-text-color-white my-fw-bold': index === matched.length - 1 }"
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

<template>
  <el-breadcrumb :separator-icon="separatorIcon" class="breadcrumb ps-py-5 ps-px-5 ps-bg-f39c12">
    <template v-for="(match, index) in matched" :key="index">
      <el-breadcrumb-item
        v-if="shouldShowBreadcrumbItem(match)"
        class="breadcrumb-item ps-text-transform-capitalize"
        :to="{ path: match.path }"
        @click="push(match.path)">
          {{ match.name }}
        </el-breadcrumb-item>
    </template>
    <el-breadcrumb-item class="breadcrumb-item" v-if="lastName">{{ lastName }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import { ref, watch, h, defineProps } from 'vue';
import { ArrowRightBold } from '@element-plus/icons-vue';
import { whiteColor } from '@/assets/scss/variables.module.scss';
import { useRoute, type RouteLocationMatched } from 'vue-router';
import useWrapperRouter from '@/composables/use-router';

const { push } = useWrapperRouter();
const separatorIcon = h(ArrowRightBold, { color: whiteColor });
const route = useRoute();
const matched = ref(route.matched);

const shouldShowBreadcrumbItem =
  (match: RouteLocationMatched) => {
    if (!(match.props.default as any).notShowBreadcrumb) {
      return ((match.name || '') as string).trim();
    }
    return false;
  };

const { lastName } = defineProps<{
  lastName: string,
}>();

watch(route, (_, newRoute): void => {
  matched.value = newRoute.matched;
});
</script>

<style lang="scss">
.breadcrumb-item {
  &:last-of-type {
    & > span {
      color: v-bind(whiteColor) !important;
      font-weight: bold !important;
    }
  }
}
</style>

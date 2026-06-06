<template>
  <el-breadcrumb
  :separator-icon="separatorIcon"
  class="breadcrumb ps-position-fixed ps-z-index-plus ps-w-100 ps-py-5 ps-px-5 ps-bg-f39c12">
    <List :items="matched">
      <template #default="{ item }">
        <el-breadcrumb-item 
          v-if="shouldShowBreadcrumbItem(item)" 
          class="breadcrumb-item ps-text-transform-capitalize"
          :to="{ path: item.path }" @click="push(item.path)">
          {{ item.name }}
        </el-breadcrumb-item>
      </template>
    </List>
    <el-breadcrumb-item class="breadcrumb-item" v-if="lastName">{{ lastName }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>
<script lang="ts" setup>
import { ref, watch, h } from 'vue';
import { ArrowRightBold } from '@element-plus/icons-vue';
import { whiteColor } from '@/assets/scss/variables.module.scss';
import { useRoute, type RouteLocationMatched } from 'vue-router';
import useWrapperRouter from '@/composables/use-router';
import List from '@/components/common/list/list.vue';

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
  lastName: string;
}>();

watch(route, (_, newRoute): void => {
  matched.value = newRoute.matched;
});
</script>

<style lang="scss">
.breadcrumb {
  &-item {
    &:last-of-type {
      &>span {
        color: v-bind(whiteColor) !important;
        font-weight: bold !important;
      }
    }
  }
}
</style>

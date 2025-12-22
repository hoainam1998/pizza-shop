<template>
  <div class="search-box
    ps-overflow-hidden
    ps-display-flex
    ps-justify-content-center
    ps-bg-white
    ps-h-35px
    ps-w-300px
    ps-border-radius-30">
      <input v-enter-press="search"
        type="text"
        class="ps-px-7 ps-fs-15 ps-w-87 ps-h-100 ps-border-none ps-outline-none"
        v-model="keyword" />
      <button class="ps-w-13 ps-h-100 ps-py-7 ps-cursor-pointer ps-border-none ps-outline-none" @click="search">
        <el-icon size="20"><Search /></el-icon>
      </button>
  </div>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import useWrapperRouter from '@/composables/use-router';
import paths from '@/router/paths';
const { push } = useWrapperRouter();
const keyword = defineModel<string>({ default: '' });

const emit = defineEmits<{
  (e: 'search', keyword: string): void;
}>();

const search = (): void => {
  push({ path: paths.BASE.Path, query: { search: keyword.value } });
  emit('search', keyword.value);
};
</script>


<template>
  <el-button class="ps-bg-2ecc71 ps-text-color-white" @click="emit('onClick')">
    <el-icon :size="20">
      <FolderAdd />
    </el-icon>
    &nbsp;
    New
  </el-button>
</template>
<script setup lang="ts">
import { FolderAdd } from '@element-plus/icons-vue';
const emit = defineEmits<{
  (e: 'onClick'): void,
}>();
</script>

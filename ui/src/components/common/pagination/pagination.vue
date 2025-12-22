<template>
  <el-pagination v-model:current-page="currentPage"
    :page-size="pageSize"
    :pager-count="pagerCount"
    layout="prev, pager, next"
    :total="total"
    class-="pagination"
    @change="paginationOnChange" />
</template>
<script setup lang="ts">
import propsValidator from './props-validator';
const currentPage = defineModel();
const { pageSize, pagerCount, total } = defineProps(propsValidator);
const emit = defineEmits<{
  (e: 'onChange', pageNumber: number): void,
}>();

const paginationOnChange = (pageNumber: number): void => emit('onChange', pageNumber);
</script>

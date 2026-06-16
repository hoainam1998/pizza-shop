<template>
  <div class="table ps-w-100">
    <el-table :data="data" :border="true" :empty-text="emptyText" :preserve-expanded-content="true"
      class="ps-w-100 ps-mt-10" header-cell-class-name="ps-bg-2ecc71" header-row-class-name="ps-text-color-white">
      <el-table-column type="expand" v-if="!!slots.expand">
        <template #default="props">
          <slot name="expand" v-bind="props"></slot>
        </template>
      </el-table-column>
      <List :items="fields">
        <template #default="{ item }">
          <el-table-column v-bind="item" :key="item.id" :prop="item.key" align="center">
            <template #default="props">
              <slot :name="item.key" v-bind="props">
                {{ props.row[item.key] !== undefined ? props.row[item.key].toString() : '' }}
              </slot>
            </template>
          </el-table-column>
        </template>
      </List>
    </el-table>
    <div class="ps-display-flex ps-justify-content-space-between ps-mt-7">
      <el-select v-model="pageSize" class="ps-w-100px" @change="pageSizeChange">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :pager-count="11"
        layout="prev, pager, next"
        :total="total"
        @change="pageNumberChange" />
    </div>
  </div>
</template>
<script lang="ts" setup generic="T">
import { useSlots, ref } from 'vue';
import List from '@/components/common/list/list.vue';
import type { TableFieldType } from '@/interfaces';
import constants from '@/constants';

const PAGE_SIZE = constants.PAGINATION.PAGE_SIZE;
const PAGE_NUMBER = constants.PAGINATION.PAGE_NUMBER;

type TablePropsType<T> = {
  fields: TableFieldType[];
  data: T[];
  total: number;
  emptyText?: string;
};

const { fields, data = [], total = 0, emptyText = 'Data are empty!' } = defineProps<TablePropsType<T>>();
const slots = useSlots();
const emit = defineEmits<{
  (e: 'pagination', pageSize: number, pageNumber: number): void;
}>();

const pageSize = ref(PAGE_SIZE);
const currentPage = ref(PAGE_NUMBER);

const options = [{
  label: '10',
  value: 10,
},
{
  label: '30',
  value: 30,
},
{
  label: '50',
  value: 50,
}];

const refresh = (): void => {
  emit('pagination', pageSize.value, PAGE_NUMBER);
};

const pageSizeChange = (): void => {
  currentPage.value = 1;
};

const pageNumberChange = (pageNumber: number): void => {
  emit('pagination', pageSize.value, pageNumber);
};

defineExpose({
  refresh,
  pageSize,
});
</script>

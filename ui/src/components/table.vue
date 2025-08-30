<template>
  <div class="my-w-100">
    <el-table :data="data" :border="true" :empty-text="emptyText" :preserve-expanded-content="true"
      class="my-w-100 my-mt-10" header-cell-class-name="my-bg-2ecc71" header-row-class-name="my-text-color-white">
      <el-table-column type="expand" v-if="!!slots.expand">
        <template #default="props">
          <slot name="expand" v-bind="props"></slot>
        </template>
      </el-table-column>
      <el-table-column v-for="(field, index) in fields" :key="index" :label="field.label" :prop="field.key">
        <template #default="props">
          <slot :name="field.key" v-bind="props">
            {{ props.row[field.key] }}
          </slot>
        </template>
      </el-table-column>
    </el-table>
    <div class="my-display-flex my-justify-content-space-between my-mt-7">
      <el-select v-model="pageSize" class="my-w-100px" @change="pageSizeChange">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-pagination v-model:current-page="currentPage" :page-size="20" :pager-count="11" layout="prev, pager, next"
        :total="1000" @change="pageNumberChange" />
    </div>
  </div>
</template>

<script lang="ts" setup generic="T">
import { useSlots, ref, defineProps, defineEmits } from 'vue';
type TableFieldType = {
  key: string;
  label: string;
  width: number;
};

type TablePropsType<T> = {
  fields: TableFieldType[]
  data: T[];
  emptyText?: string;
};

const { fields, data = [], emptyText = 'Data are empty!' } = defineProps<TablePropsType<T>>();
const slots = useSlots();
const emit = defineEmits<{
  (e: 'pagination', pageSize: number, pageNumber: number): void;
}>();

const pageSize = ref(30);
const currentPage = ref(1);

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

const pageSizeChange = (pageSize: number): void => {
  emit('pagination', pageSize, currentPage.value);
};

const pageNumberChange = (pageNumber: number): void => {
  emit('pagination', pageSize.value, pageNumber);
};
</script>

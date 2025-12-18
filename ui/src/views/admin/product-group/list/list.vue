<template>
  <div class="ps-display-flex ps-flex-gap-5 ps-mt-5 ps-mb-5">
    <el-button class="ps-bg-2ecc71 ps-text-color-white" @click="navigateToDetail()">New</el-button>
    <SearchBox v-model="keyword" @search="search" />
  </div>
  <Table
    ref="productTable"
    :fields="fields"
    :data="data"
    :total="total"
    emptyText="Products are empty!"
    @pagination="fetchProducts">
    <template #avatar="props">
      <img :src="props.row.avatar" height="50" width="50" :alt="props.row.name" />
    </template>
    <template #category="props">
      <div class="ps-display-flex ps-align-items-center ps-flex-gap-7">
        <img :src="props.row.avatar" height="50" width="50" :alt="props.row.name" />
        {{ props.row.category.name }}
      </div>
    </template>
    <template #expiredTime="props">
      {{ $formatDateHyphen(props.row.expiredTime) }}
    </template>
    <template #price="props">
      {{ $formatVNDCurrency(props.row.price) }}
    </template>
    <template #operation="props">
      <div class="ps-text-align-center">
        <el-button size="small" class="ps-fw-bold" type="success" @click="navigateToDetail(props.row.productId)">
          Update
        </el-button>
        <el-button
          size="small"
          class="ps-fw-bold"
          type="danger"
          :disabled="props.row.disabled"
          @click="deleteProduct(props.row.productId)">
            Delete
        </el-button>
      </div>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, useTemplateRef, type Ref } from 'vue';
import type { AxiosResponse } from 'axios';
import Table from '@/components/common/table.vue';
import SearchBox from '@/components/admin/search-box.vue';
import type { TableFieldType } from '@/interfaces';
import constants from '@/constants';
import paths from '@/router/paths';
import { ProductService } from '@/services';
import useWrapperRouter from '@/composables/use-router';
import { confirmDeleteMessageBox } from '@/utils';

const showDeleteDialog = confirmDeleteMessageBox(
  'Delete product!',
  'This product and all information about it will be delete! Are you sure to be continue?',
  'Delete product request was cancel!');
const { push } = useWrapperRouter();
const productTableRef = useTemplateRef('productTable');
const PAGE_SIZE = constants.PAGINATION.PAGE_SIZE;
const PAGE_NUMBER = constants.PAGINATION.PAGE_NUMBER;
const keyword: Ref<string> = ref('');

defineOptions({
  inheritAttrs: false
});

const fields: TableFieldType[] = [
  {
    label: 'Avatar',
    key: 'avatar',
    width: 100,
  },
  {
    label: 'Name',
    key: 'name',
    width: 300,
  },
  {
    label: 'Category',
    key: 'category',
    width: 250,
  },
  {
    label: 'Count',
    key: 'count',
    width: 150,
  },
  {
    label: 'Price',
    key: 'price',
    width: 200,
  },
  {
    label: 'Expired time',
    key: 'expiredTime',
    width: 220,
  },
  {
    label: 'Status',
    key: 'status',
    width: 150,
  },
  {
    key: 'operation',
  }
];

const data: Ref<any[]> = ref([]);
const total: Ref<number> = ref(0);

const navigateToDetail = (productId?: string): void => {
  if (productId) {
    push(`${paths.HOME.PRODUCT}/${productId}`);
  } else {
    push(`${paths.HOME.PRODUCT}/${paths.HOME.PRODUCT.NEW}`);
  }
};

const search = (): void => {
  fetchProducts(productTableRef.value?.pageSize || PAGE_SIZE, PAGE_NUMBER);
};

const deleteProduct = (productId: string): void => {
  const deleteProductService = (): Promise<AxiosResponse> => {
    return ProductService.delete(`delete/${productId}`).then((response) => {
      productTableRef.value?.refresh();
      return response;
    });
  };
  showDeleteDialog(deleteProductService);
};

const fetchProducts = (pageSize: number, pageNumber: number): void => {
  ProductService.post('pagination', {
    pageSize,
    pageNumber,
    search: keyword.value,
    query: {
      name: true,
      avatar: true,
      count: true,
      price: true,
      originalPrice: true,
      status: true,
      expiredTime: true,
      category: true,
      ingredients: true,
      disabled: true,
    }
  }, { allowNotFound: true }).then((response) => {
    data.value = response.data.list;
    total.value = response.data.total;
  }).catch(() => {
    data.value = [];
    total.value = 0;
  });
};

onBeforeMount(() => fetchProducts(PAGE_SIZE, PAGE_NUMBER));
</script>

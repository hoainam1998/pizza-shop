<template>
  <div class="ps-display-flex ps-flex-gap-5 ps-mt-5 ps-mb-5">
    <el-button class="ps-bg-2ecc71 ps-text-color-white" @click="navigateToDetail">New</el-button>
    <SearchBox v-model="keyword" @search="search" />
  </div>
  <Table :fields="fields" :data="data" :total="total" emptyText="Products are empty!" @pagination="fetchProducts">
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
      {{ $formatVNDCurrency(props.row.price ) }}
    </template>
    <template #operation="props">
      <div class="ps-text-align-center">
        <el-button size="small" class="ps-fw-bold" type="success">
          Update
        </el-button>
        <el-button size="small" class="ps-fw-bold" type="danger" :disabled="props.row.disabled" @click="deleteProduct">
          Delete
        </el-button>
      </div>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue';
import Table from '@/components/table.vue';
import SearchBox from '@/components/search-box.vue';
import type { TableFieldType } from '@/interfaces';
import constants from '@/constants';
import paths from '@/router/paths';
import { ProductService } from '@/services';
import useWrapperRouter from '@/composables/use-router';
import confirmDeleteMessageBox from './confirm-delete-message-box';

const { push } = useWrapperRouter();

const PAGE_SIZE = constants.PAGINATION.PAGE_SIZE;
const PAGE_NUMBER = constants.PAGINATION.PAGE_NUMBER;
const keyword: Ref<string> = ref('');

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

const navigateToDetail = (): void => {
  push(paths.HOME.PRODUCT);
};

const search = (keyword: string): void => {
  fetchProducts(PAGE_SIZE, PAGE_NUMBER, keyword);
};

const deleteProduct = () => {
  const deleteProductService = (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            message: 'Delete product!',
          }
        });
      }, 100);
    });
  };

  confirmDeleteMessageBox(deleteProductService);
};

const fetchProducts = (pageSize: number, pageNumber: number, keyword?: string): void => {
  ProductService.post('pagination', {
    pageSize,
    pageNumber,
    search: keyword,
    query: {
      name: true,
      avatar: true,
      count: true,
      price: true,
      'original_price': true,
      status: true,
      'expired_time': true,
      category: true,
      ingredients: true,
      disabled: true,
    }
  }, { allowNotFound: true }).then((response) => {
    data.value = response.data.list;
    total.value = response.data.total;
  });
};

onBeforeMount(() => fetchProducts(PAGE_SIZE, PAGE_NUMBER));
</script>
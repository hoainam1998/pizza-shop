<template>
  <div class="ps-display-flex ps-flex-gap-5 ps-mt-5 ps-mb-5">
    <el-button class="ps-bg-2ecc71 ps-text-color-white" @click="showDialog">New</el-button>
    <SearchBox ref="searchBox" v-model="keyword" @search="search" />
  </div>
  <Table ref="ingredientTable" :fields="fields" :data="data" :total="total" emptyText="Ingredients are empty!"
    @pagination="fetchIngredients">
    <template #avatar="props">
      <img :src="props.row.avatar" height="50" width="50" :alt="props.row.name" />
    </template>
    <template #expiredTime="props">
      {{ $formatDateHyphen(props.row.expiredTime) }}
    </template>
    <template #price="props">
      {{ $formatVNDCurrency(props.row.price) }}
    </template>
    <template #operation="props">
      <div class="ps-text-align-center">
        <el-button size="small" class="ps-fw-bold" type="success" @click="getIngredient(props.row.ingredientId)">
          Update
        </el-button>
        <el-button size="small" class="ps-fw-bold" type="danger" @click="deleteIngredient(props.row)">
          Delete
        </el-button>
      </div>
    </template>
  </Table>
  <IngredientDetail
    v-model="dialogVisible"
    ref="ingredientDetailRef"
    @onComplete="onComplete"/>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, useTemplateRef, type Ref } from 'vue';
import type { AxiosError, AxiosResponse } from 'axios';
import Table from '@/components/common/table.vue';
import SearchBox from '@/components/admin/search-box.vue';
import IngredientDetail from '@/views/admin/ingredient-group/detail/detail.vue';
import type { IngredientType, TableFieldType } from '@/interfaces';
import constants from '@/constants';
import { IngredientService } from '@/services';
import { confirmDeleteMessageBox, showErrorNotification, showSuccessNotification } from '@/utils';

const showDeleteDialog = confirmDeleteMessageBox(
  'Delete ingredient!',
  'This ingredient and all information about it will be delete! Are you sure to be continue?',
  'Delete ingredient request was cancel!');

const searchBoxRef = useTemplateRef('searchBox');
const ingredientDetailRef = useTemplateRef('ingredientDetailRef');
const ingredientTableRef = useTemplateRef('ingredientTable');
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
    width: 150,
  },
  {
    label: 'Name',
    key: 'name',
    width: 350,
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
    label: 'Unit',
    key: 'unit',
    width: 150,
  },
  {
    label: 'Expired time',
    key: 'expiredTime',
    width: 220,
  },
  {
    label: 'Status',
    key: 'status',
    width: 200,
  },
  {
    key: 'operation',
  }
];

const dialogVisible = ref(false);
const data: Ref<IngredientType[]> = ref([]);
const total: Ref<number> = ref(0);

const search = (): void => {
  fetchIngredients(ingredientTableRef.value?.pageSize || PAGE_SIZE, PAGE_NUMBER);
};

const onComplete = (): void => {
  searchBoxRef.value?.reset();
};

const getIngredient = (ingredientId: string): void => {
  IngredientService.post('detail', {
    ingredientId,
    query: {
      name: true,
      avatar: true,
      price: true,
      count: true,
      unit: true,
      expiredTime: true,
    },
  }).then((response: AxiosResponse) => {
    ingredientDetailRef.value!.assignForm(response.data).then(() => showDialog());
  }).catch((error: AxiosError<any>) => {
    showErrorNotification('Get ingredient!', error.response!.data.messages);
  });
};

const deleteIngredient = (ingredient: IngredientType): void => {
  const { ingredientId, disabled } = ingredient;
  const deleteIngredientService = (): Promise<AxiosResponse> => {
    return IngredientService.delete(`delete/${ingredientId}`).then((response) => {
      ingredientTableRef.value?.refresh();
      showSuccessNotification('Delete ingredient!', response.data.messages);
      return response;
    }).catch((error) => {
      showErrorNotification('Delete ingredient!', error.response.data.messages);
      throw error;
    });
  };

  if (disabled) {
    showDeleteDialog(deleteIngredientService);
  } else {
    deleteIngredientService();
  }
};

const showDialog = (visible = true): void => {
  dialogVisible.value = visible;
};

const fetchIngredients = (pageSize: number, pageNumber: number): void => {
  IngredientService.post('pagination', {
    pageSize,
    pageNumber,
    search: keyword.value,
    query: {
      name: true,
      avatar: true,
      count: true,
      price: true,
      status: true,
      expiredTime: true,
      unit: true,
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

onBeforeMount(() => fetchIngredients(PAGE_SIZE, PAGE_NUMBER));
</script>

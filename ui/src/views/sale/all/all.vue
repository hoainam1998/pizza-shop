<template>
  <CategorySelection :items="categories" />
  <Products
    :total="productsForSale.total"
    :products="productsForSale.products"
    @onChange="paginationOnChange"
    ref="productsRef" />
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef, reactive, onBeforeMount, onBeforeUnmount } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import CategorySelection from '@/components/sale/category-selection/category-selection.vue';
import Products from '@/components/sale/product/products/products.vue';
import { ProductService, CategoryService } from '@/services';
import { type ProductPropsType } from '@/components/sale/product/products/props-validator';
import { type CategorySelectionPropsType } from '@/components/sale/category-selection/props-validator';
import SocketService from '@/socket';
import { showErrorNotification } from '@/utils';
import { SOCKET_EVENT_NAME } from '@/enums';

type ProductsForSaleType = {
  products: ProductPropsType['products'];
  total: number;
};

const route = useRoute();
const search = ref<string>(route.query.search as string);
const categoryId = ref<string>(route.query.category as string);
const productsComponentRef = useTemplateRef('productsRef');
const productsForSale = reactive<ProductsForSaleType>({
  products: [],
  total: 0,
});

const categories = ref<CategorySelectionPropsType['items']>([]);

const onChange = (pageNumber?: number): void => {
  ProductService.post('pagination-for-sale', {
    pageNumber: pageNumber || productsComponentRef.value!.currentPage,
    categoryId: categoryId.value,
    search: search.value,
    query: {
      name: true,
      count: true,
      price: true,
      avatar: true,
      bought: true,
      ingredients: {
        name: true,
      },
    },
  }, { allowNotFound: true })
  .then((response) => {
    productsForSale.total = response.data.total;
    productsForSale.products = response.data.list;
  }).catch((error) => {
    productsForSale.total = 0;
    productsForSale.products = [];
    showErrorNotification('Product for sale!', error.response.data.messages);
  });
};

const filterValidCategory = (): void => {
  CategoryService.post('filter-valid-categories', {
    name: true,
    avatar: true,
  }).then((response) => {
    categories.value = response.data;
  }).catch((error) => {
    showErrorNotification('Filter valid categories!', error.response.data.messages);
    categories.value = [];
  });
};

const paginationOnChange = (pageNumber: number): void => {
  onChange(pageNumber);
};

onBeforeMount(() => {
  SocketService.subscribe(SOCKET_EVENT_NAME.REFRESH,
    () => setTimeout(() => onChange(), 500)
  );
});

onBeforeUnmount(() => SocketService.unsubscribe(SOCKET_EVENT_NAME.REFRESH));

onBeforeRouteUpdate((to) => {
  search.value = to.query.search as string;
  categoryId.value = to.query.category as string;
  onChange();
});

onMounted(() => {
  onChange();
  filterValidCategory();
});
</script>

<template>
  <section class="products ps-bg-white ps-px-10 ps-py-10">
    <div class="ps-display-desktop-flex
    ps-display-tablet-flex
    ps-display-large-tablet-flex
    ps-justify-content-desktop-space-between
    ps-justify-content-large-tablet-space-between
    ps-justify-content-tablet-space-between
    ps-align-items-desktop-center">
      <ResultSearch :total="total" />
      <div class="ps-display-mobile-flex ps-justify-content-center">
        <Pagination v-model="model" :pagerCount="7" :page-size="10" :total="100" />
      </div>
    </div>
    <hr/>
    <ul v-grid-product-border class="products-wrapper ps-list-style-none ps-px-0 ps-display-grid ps-mt-10">
      <List :items="products" key-field="productId">
        <template #default="{ item }">
          <li><ProductItem :item="item" /></li>
        </template>
      </List>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { useId, ref } from 'vue';
import ProductItem from '../product-item/product-item.vue';
import List from '@/components/common/list.vue';
import Pagination from '@/components/common/pagination/pagination.vue';
import ResultSearch from '@/components/sale/product/result-search/result-search.vue';
import avatar from '@/assets/images/logo.png';
import { vGridProductBorder } from './directives';
const model = ref<number>(1);

const createProducts = (length: number = 10): any[] => {
  return Array.apply(this, Array(length)).map(() => {
    return {
      productId: useId(),
      name: 'product',
      avatar,
      price: 10000,
      bought: 2,
      ingredients: ['ingredient 1', 'ingredient 2'],
    };
  });
};

const products = createProducts(22);
const total = products.length;
</script>
<style lang="scss" scoped>
.products-wrapper {
  @include responsive.mobile {
    grid-template-columns: repeat(2, 1fr);
  }

  @include responsive.tablet {
    grid-template-columns: repeat(3, 1fr);
  }

  @include responsive.large-tablet {
    grid-template-columns: repeat(3, 1fr);
  }

  @include responsive.desktop {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

<template>
  <section class="products ps-mt-10 ps-bg-white ps-px-10 ps-py-10">
    <ul v-grid-product-border class="products-wrapper ps-list-style-none ps-px-0 ps-display-grid ">
      <List :items="products" key-field="productId">
        <template #default="{ item }">
          <li><ProductItem :item="item" /></li>
        </template>
      </List>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { useId } from 'vue';
import ProductItem from '../product-item/product-item.vue';
import List from '@/components/common/list.vue';
import avatar from '@/assets/images/logo.png';
import vGridProductBorder from '@/directives/grid-product-border';

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

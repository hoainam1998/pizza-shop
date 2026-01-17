<template>
  <section class="products ps-bg-white">
    <div
    v-position-top
    v-scroll
    class="ps-position-sticky
    ps-display-desktop-flex
    ps-display-tablet-flex
    ps-display-large-tablet-flex
    ps-justify-content-desktop-space-between
    ps-justify-content-large-tablet-space-between
    ps-justify-content-tablet-space-between
    ps-align-items-center
    ps-bg-white
    ps-px-10
    ps-py-5
    ps-border-width-top-1
    ps-border-color-top-black
    ps-border-style-top-solid">
      <ResultSearch :total="total" />
      <div class="ps-display-mobile-flex ps-justify-content-center">
        <Pagination v-model="currentPage" :pagerCount="7" :page-size="10" :total="total"  @onChange="onChange" />
      </div>
    </div>
    <hr/>
    <ul v-if="products.length"
      v-grid-product-border
      class="products-wrapper ps-list-style-none ps-px-0 ps-display-grid ps-px-10 ps-py-10">
        <List :items="products" key-field="productId">
          <template #default="{ item }">
            <li><ProductItem :item="item" /></li>
          </template>
        </List>
    </ul>
    <div v-else
      class="ps-display-flex ps-flex-direction-column ps-justify-content-center ps-align-items-center ps-py-7">
        <img :src="EmptyLogo" alt="empty logo" height="200" width="200" />
        <h3 class="ps-fw-bold">Not found!</h3>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ProductItem from '../product-item/product-item.vue';
import List from '@/components/common/list.vue';
import Pagination from '@/components/common/pagination/pagination.vue';
import ResultSearch from '@/components/sale/product/result-search/result-search.vue';
import EmptyLogo from '@/assets/images/empty.png';
import { vGridProductBorder, vPositionTop } from './directives';
import { type ProductPropsType } from './props-validator';
const currentPage = ref<number>(1);

const { total = 0, products = [] } = defineProps<ProductPropsType>();
const emit = defineEmits<{
  (e: 'onChange', pageNumber: number): void;
}>();

const onChange = (pageNumber: number): void => {
  emit('onChange', pageNumber);
};

defineExpose({
  currentPage
});
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

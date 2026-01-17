<template>
  <div class="product-item ps-px-10 ps-py-10">
    <div class="ps-mb-10
      ps-display-flex
      ps-flex-direction-mobile-column
      ps-flex-direction-tablet-column
      ps-flex-direction-large-tablet-column
      ps-flex-gap-10">
        <img :src="item.avatar" :alt="item.name"
          class="ps-w-40 ps-h-40 ps-margin-mobile-auto ps-margin-tablet-auto ps-margin-large-tablet-auto" />
        <div class="ps-w-100">
          <div class="ps-px-7">
            <h4 class="ps-mb-7 ps-text-truncate-2 ps-unselect ps-w-100">{{ item.name }}</h4>
            <span class="ps-display-flex
              ps-unselect
              ps-justify-content-desktop-space-between
              ps-justify-content-large-tablet-space-between
              ps-justify-content-tablet-space-between
              ps-align-items-desktop-center
              ps-flex-direction-mobile-column">
                <span class="ps-fw-bold">{{ $formatVNDCurrency(item.price) }}</span>
                <span class="ps-fs-13 ps-text-color-606266">Bought:&nbsp;{{ $replaceThousand(item.bought) }}</span>
            </span>
          </div>
          <hr />
          <ul class="ps-px-0 ps-list-style-none">
            <li class="ps-display-inline ps-fs-14 ps-fw-bold">Ingredients:&nbsp;</li>
            <List :items="item.ingredients">
              <template #default="{ item }">
                <li class="ingredient-item ps-fs-13 ps-display-inline">{{ item.name }}</li>
              </template>
            </List>
          </ul>
        </div>
    </div>
    <p v-if="disabledAddButton"
      class="ps-text-align-center ps-fs-12 ps-fw-bold ps-text-color-f56c6c ps-mb-5">
        Quantity overcome to limit.
    </p>
    <el-button
      class="ps-bg-eb2f06
      ps-text-color-black
      ps-bg-gray-disabled
      ps-fw-bold
      ps-display-block
      ps-margin-auto
      ps-w-100px
      ps-line-height-10"
      :disabled="disabledAddButton"
      @click="add">
        Add
    </el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import List from '@/components/common/list.vue';
import { type ProductItemsPropsType } from './props-validator';
import { useProductsInCart } from '@/composables/store';
import IndexedDb from '@/indexed-db';
import { OBJECT_STORE_NAME } from '@/enums';
import { type ClientCartItemType } from '@/interfaces';

const cart = useProductsInCart();
const quantity = ref<number>(0);
const { item } = defineProps<ProductItemsPropsType>();

const createCartItem = (quantity: number): Omit<ClientCartItemType, 'total'> => {
  return {
    name: item.name,
    avatar: item.avatar,
    quantity,
    limit: item.count,
    price: item.price,
    productId: item.productId,
  };
};

const add = (): void => {
  IndexedDb.get(OBJECT_STORE_NAME.CARTS, item.productId).then((result) => {
    if (result) {
      if (result.quantity < item.count) {
        quantity.value = result.quantity + 1;
        IndexedDb.update(OBJECT_STORE_NAME.CARTS, createCartItem(quantity.value));
        cart.calcTotal();
      }
    } else {
      IndexedDb.add(OBJECT_STORE_NAME.CARTS, createCartItem(1));
      cart.calcTotal();
    }
  });
};

const disabledAddButton = computed<boolean>(() => quantity.value === item.count);

onMounted(() => {
  IndexedDb.get(OBJECT_STORE_NAME.CARTS, item.productId).then((result) => {
    if (result) {
      quantity.value = result.quantity;
    }
  });
});
</script>
<style lang="scss" scoped>
.ingredient-item {
  &:not(:last-child) {
    &::after {
      content: ' - '
    }
  }
}
</style>

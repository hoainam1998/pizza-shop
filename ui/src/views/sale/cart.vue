<template>
  <section class="ps-py-10 ps-py-10 ps-px-10 ps-bg-transparent">
    <div class="ps-bg-white ps-border-radius-5 ps-py-10 ps-px-10">
      <div class="ps-display-flex ps-flex-gap-10 ps-flex-direction-mobile-column ps-flex-direction-desktop-row">
        <ul class="ps-w-mobile-100 ps-w-desktop-60 ps-list-style-none ps-pl-0 ps-max-h-88vh ps-overflow-auto">
          <List :items="carts" keyField="productId">
            <template #default="{ item }">
              <li class="ps-display-flex
                ps-mb-10
                ps-px-7
                ps-py-7
                ps-border-width-1
                ps-border-radius-5
                ps-border-color-black
                ps-border-style-dashed">
                  <CartItem
                    :cart="item"
                    @delete="item.delete"
                    @calcTotal="item.calcTotal"/>
              </li>
            </template>
          </List>
        </ul>
        <div class="ps-w-mobile-100 ps-w-desktop-40 ps-px-desktop-10 ps-px-mobile-0">
          <h2 class="ps-fw-bold ps-text-transform-capitalize">Bills</h2>
          <hr />
          <ul class="ps-list-style-none ps-max-h-80vh ps-overflow-auto ps-pl-0">
            <List :items="carts" keyField="productId">
              <template #default="{ item }">
                <li class="ps-px-10">
                  <BillItem :cart="item" />
                </li>
              </template>
            </List>
          </ul>
          <div class="ps-display-flex ps-mt-10 ps-justify-content-space-between ps-align-items-center">
            <span>
              <span class="ps-fw-bold">Total:&nbsp;</span>
              <span class="ps-text-style-italic">{{ $formatVNDCurrency(total) }}</span>
            </span>
            <el-button type="primary" class="ps-w-mobile-100px">
              Payment
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { reactive, useId, computed } from 'vue';
import CartItem from '@/components/sale/cart/cart-item.vue';
import BillItem from '@/components/sale/cart/bill-item.vue';
import List from '@/components/list.vue';
import avatar from '@/assets/images/logo.png';

const total = computed(() => {
  return carts.reduce((count, cart) => {
    count += cart.total;
    return count;
  }, 0);
});

const getCartItemIndex = (productId: string): number => {
  return carts.findIndex((cart) => cart.productId === productId);
};

const deleteCart = (productId: string) => (): void => {
  const index = getCartItemIndex(productId);
  if (index >= 0) {
    carts.splice(index, 1);
  }
};

const calcTotal = (productId: string) => (quantity: number): void => {
  const index = getCartItemIndex(productId);
  if (index >= 0) {
    carts[index].quantity = quantity;
    carts[index].total = carts[index].price * quantity;
  }
};

const createCartItems = (length: number = 10): any[] => {
  return Array.apply(this, Array(length)).map((_, index) => {
    const id = useId();
    const price = 1000;
    const amount = 1;
    const total = price * amount;

    return {
      productId: id,
      name: 'product name ' + (index + 1),
      avatar,
      quantity: 1,
      limit: 10,
      price,
      total,
      delete: deleteCart(id),
      calcTotal: calcTotal(id),
    };
  });
};

const carts = reactive(createCartItems());
</script>

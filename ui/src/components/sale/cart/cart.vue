<template>
  <div class="cart
    ps-box-shadow-1
    ps-cursor-pointer
    ps-position-relative
    ps-bg-black
    ps-border-radius-pc-50
    ps-w-40px
    ps-h-40px"
    @click="navigateToCart">
      <el-icon :color="whiteColor" :size="25" class="ps-margin-auto ps-display-block ps-py-8">
        <ShoppingCartFull />
      </el-icon>
      <span class="amount
        ps-unselect
        ps-text-color-white
        ps-fw-bold
        ps-position-absolute
        ps-top-minus-15
        ps-right-5
        ps-fs-12">
          {{ amountText }}
      </span>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { ShoppingCartFull } from '@element-plus/icons-vue';
import { whiteColor } from '@/assets/scss/variables.module.scss';
import useWrapperRouter from '@/composables/use-router';
import { useProductsInCart } from '@/composables/store';
import paths from '@/router/paths';

const { push } = useWrapperRouter();
const cart = useProductsInCart();
const navigateToCart = () => push(paths.CART);

const amountText = computed<string>(() => {
  const value = cart.total.toString();
  return value.length > 3 ? `${value.slice(0, 3)}+` : value;
});
</script>

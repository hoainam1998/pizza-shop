<template>
  <div class="cart ps-cursor-pointer ps-position-relative ps-bg-black ps-border-radius-pc-50 ps-w-40px ps-h-40px"
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
        {{amountText}}
    </span>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { ShoppingCartFull } from '@element-plus/icons-vue';
import { whiteColor } from '@/assets/scss/variables.module.scss';
import useWrapperRouter from '@/composables/use-router';
import paths from '@/router/paths';

const { push } = useWrapperRouter();
const navigateToCart = () => push(paths.CART);
const amount = ref<number>(100000);

const amountText = computed(() => {
  const value = amount.value.toString();
  return value.length > 3 ? `${value.slice(0, 3)}+` : value;
});

</script>
<style lang="scss" scoped>
.cart {
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
</style>

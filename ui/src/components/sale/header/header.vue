<template>
  <header v-scroll class="sale-header
  ps-position-sticky
  ps-top-0
  ps-z-index-plus
  ps-display-flex
  ps-justify-content-space-between
  ps-align-items-center
  ps-bg-eb2f06
  ps-py-7
  ps-px-7
  ps-w-desktop-100
  ps-w-mobile-100
  ps-w-tablet-100
  ps-w-large-tablet-100">
    <RouterLink :to="paths.BASE.Path">
      <img src="@/assets/images/logo.png" class="ps-box-shadow-1" height="30" width="30" />
    </RouterLink>
    <SearchBox />
    <Cart />
  </header>
</template>
<script setup lang="ts">
import paths from '@/router/paths';
import Cart from '@/components/sale/cart/cart.vue';
import SearchBox from '@/components/sale/search-box/search-box.vue';
</script>

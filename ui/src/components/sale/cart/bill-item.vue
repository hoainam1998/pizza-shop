<template>
  <h4 class="ps-display-flex
    ps-border-width-bottom-1
    ps-border-color-black
    ps-border-style-bottom-solid
    ps-justify-content-space-between
    ps-align-items-center
    ps-py-5">
      <span class="ps-fw-bold ps-w-65 ps-text-truncate-2">
        {{ cart.name }}
      </span>
      <span>
        <span class="ps-fw-bold">{{ cart.quantity }}</span>
        x
        <span class="ps-fw-bold ps-text-style-italic">{{ $formatVNDCurrency(cart.price) }}</span>
        =
        <span class="ps-fw-bold ps-text-style-italic">{{ $formatVNDCurrency(cart.total) }}</span>
      </span>
  </h4>
</template>
<script setup lang="ts">
const { cart } = defineProps<{
  cart: {
    name: string;
    quantity: number;
    total: number;
    price: number;
  }
}>();
</script>

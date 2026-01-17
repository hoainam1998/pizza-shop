<template>
  <div class="ps-display-flex
    ps-flex-gap-10
    ps-position-relative
    ps-border-width-bottom-1
    ps-border-color-black
    ps-border-style-bottom-solid
    ps-justify-content-space-between
    ps-align-items-center
    ps-py-5
    ps-px-10"
    :class="{ 'ps-unselect no-exist': cart.noExist }">
      <span class="ps-fw-bold ps-w-60 ps-text-truncate-2">
        {{ cart.name }}
      </span>
      <span class="ps-w-40">
        <span class="ps-fw-bold">{{ cart.quantity }}</span>
        x
        <span class="ps-fw-bold ps-text-style-italic">{{ $formatVNDCurrency(cart.price) }}</span>
        =
        <span class="ps-fw-bold ps-text-style-italic">{{ $formatVNDCurrency(cart.total) }}</span>
      </span>
    </div>
</template>
<script setup lang="ts">
const { cart } = defineProps<{
  cart: {
    name: string;
    quantity: number;
    total: number;
    price: number;
    noExist: boolean;
  }
}>();
</script>


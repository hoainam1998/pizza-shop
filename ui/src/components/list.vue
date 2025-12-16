<template>
  <template v-if="keyField">
    <template v-for="item in list" :key="item[keyField]">
      <slot :item="item" />
    </template>
  </template>
  <template v-else>
    <template v-for="item in list" :key="item.id">
      <slot :item="item" />
    </template>
  </template>
</template>
<script setup lang="ts">
import { useId, computed } from 'vue';
const { items, keyField } = defineProps<{
  items: any[];
  keyField?: string;
}>();

const list = computed(() => {
  return keyField ? items : items.map((item) => ({ ...item, id: useId() }));
});
</script>

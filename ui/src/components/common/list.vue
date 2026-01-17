<template>
  <template v-if="keyField">
    <template v-for="(item, index) in list" :key="item[keyField]">
      <slot :item="item" :index="index" />
    </template>
  </template>
  <template v-else>
    <template v-for="(item, index) in list" :key="item.id">
      <slot v-if="item.data" :item="item.data" :index="index" />
      <slot v-else :item="item" :index="index" />
    </template>
  </template>
</template>
<script setup lang="ts">
import { useId, computed } from 'vue';
const { items = [], keyField } = defineProps<{
  items: any[];
  keyField?: string;
}>();

const list = computed(() => {
  return keyField ? items : items.map((item) => {
    if (typeof item === 'object' && Object.keys(item).length) {
      return { ...item, id: useId() };
    }
    return { data: item, id: useId() };
  });
});
</script>

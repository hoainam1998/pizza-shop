<template>
  <div class="result-search ps-position-sticky">
    <span class="ps-fs-14 ps-display-flex ps-align-items-center ps-flex-gap-30">
      <span>{{ result }}</span>
      <span>Total: {{ total }} items</span>
    </span>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { onBeforeRouteUpdate , useRoute } from 'vue-router';
import propsValidator from './props-validator';

const { total } = defineProps(propsValidator);

const showResultFor = (route: ReturnType<typeof useRoute>): string => {
  const search = route.query.search;
  const category = route.query.categoryName;

  if (search) {
    return `Result for: ${search}`;
  } else if (category) {
    return `Category: ${category}`;
  } else {
    return 'All';
  }
};

const route = useRoute();
const result = ref<string>(showResultFor(route));

onBeforeRouteUpdate((to) => {
  result.value = showResultFor(to);
});
</script>

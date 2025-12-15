<template>
  <section class="category-selection ps-border-radius-10 ps-py-10 ps-px-10 ps-my-7 ps-bg-white">
    <ul v-select="selectedId"
      class="ps-display-flex ps-flex-wrap ps-justify-content-center ps-flex-gap-10 ps-list-style-none ps-px-0">
      <li class="ps-hover-scale ps-cursor-pointer ps-box-shadow-2 ps-py-5 ps-px-5 ps-border-radius-5 ps-bg-white"
        v-for="(category, index) in categories" :key="index" :data-id="category.categoryId">
        <router-link :to="category.to" class="ps-text-decorator-none">
          <img src="@/assets/images/logo.png"
            class="ps-display-block ps-margin-auto ps-w-mobile-30px ps-h-mobile-30px" />
          <span class="ps-fw-bold ps-fs-mobile-14 ps-text-color-black">{{ category.name }}</span>
        </router-link>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, onBeforeRouteUpdate } from 'vue-router';
import paths from '@/router/paths';
import { primaryColor } from '@/assets/scss/variables.module.scss';
import vSelect from '@/directives/category-selected';

const selectedId = ref<string>(new URL(window.location.href).searchParams.get('category')!);

const categories = [{
  name: 'category 1',
  categoryId: 1,
  to: {
    path: paths.BASE.Path,
    query: {
      category: 1,
    }
  }
},
{
  name: 'category 1',
  categoryId: 2,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 2,
    }
  }
},
{
  name: 'category 1',
  categoryId: 3,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 3,
    }
  }
},
{
  name: 'category 1',
  categoryId: 4,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 4,
    }
  }
},
{
  name: 'category 1',
  categoryId: 5,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 5,
    }
  }
},
{
  name: 'category 1',
  categoryId: 6,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 6,
    }
  }
},
{
  name: 'category 1',
  categoryId: 7,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 7,
    }
  }
},
{
  name: 'category 1',
  categoryId: 8,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 8,
    }
  }
},
{
  name: 'category 1',
  categoryId: 9,
    to: {
    path: paths.BASE.Path,
    query: {
      category: 9,
    }
  }
}];

onBeforeRouteUpdate((to) => { selectedId.value = to.query.category as string; });
</script>
<style lang="scss" scoped>
.selected {
  outline: 2px solid v-bind(primaryColor) !important;
}
</style>

<template>
  <section
    class="category-selection
    ps-w-large-tablet-100
    ps-w-tablet-100
    ps-w-mobile-100
    ps-bg-white
    ps-position-sticky
    ps-top-53px
    ps-z-index-plus
    ps-py-10
    ps-px-10">
    <ul v-select="selectedId"
      class="ps-display-flex ps-flex-nowrap ps-justify-content-center ps-flex-gap-10 ps-list-style-none ps-px-0">
      <List :items="currentCategoryPage.items">
        <template #default="{ item }">
          <li class="ps-hover-scale ps-cursor-pointer ps-box-shadow-2 ps-py-5 ps-px-5 ps-border-radius-5 ps-bg-white"
            :data-id="item.categoryId">
            <router-link :to="item.to"
              class="ps-text-decorator-none ps-display-flex ps-align-items-center ps-flex-gap-7">
              <img src="@/assets/images/logo.png" class="ps-display-block ps-margin-auto ps-w-30px ps-h-30px" />
              <span class="ps-fw-bold ps-fs-13 ps-text-color-black">{{ item.name }}</span>
            </router-link>
          </li>
        </template>
      </List>
    </ul>
    <ul class="ps-list-style-none ps-px-0 ps-display-flex ps-justify-content-center ps-flex-gap-7 ps-mt-7">
      <List :items="categoryPages!" keyField="categoryId">
        <template #default="{ item, index }">
          <button class="ps-cursor-pointer ps-px-10 ps-py-4 ps-border-none ps-border-radius-3"
            :class="[currentCategoryPage.page === (index + 1) ? 'ps-bg-eb2f06' : 'ps-bg-gray']"
            @click="item.onPageChange" />
        </template>
      </List>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import List from '@/components/common/list.vue';
import paths from '@/router/paths';
import breakPoint from '@/assets/js/break-points.js';
import { vSelect } from './directives';
import { type CategorySelectionPropsType } from './props-validator';
import { setTimeout } from '@/utils';

const { items = [] } = defineProps<CategorySelectionPropsType>();
const currentRoute = useRoute();

watch(currentRoute, (route) => {
  selectedId.value = route.query.category as string;
});

const selectedId = ref<string>((currentRoute.query.category as string)!);
const categoryPages = ref<any[]>();
const currentCategoryPage = ref<any>({ isActive: true, page: 1, items: [] });

const categories = computed(() => {
  return items.map((category) => ({
    name: category.name,
    categoryId: category.categoryId,
    to: {
      path: paths.BASE.Path,
      query: {
        category: category.categoryId,
        categoryName: category.name,
        ...currentRoute.query,
      },
    },
  }));
});

const showCategories = (size: number = 10): void => {
  const categorySelectedId = (currentRoute.query.category as string || (categories.value[0] || {}).categoryId);
  const pageNumber = Math.floor((categories.value.length / size)) + (categories.value.length % size > 0 ? 1 : 0);
  const pages = [];

  for (let i = 0; i < pageNumber; i++) {
    const offset = i * size;
    const limit = i === pageNumber - 1 ? categories.value.length : (i + 1) * size;
    const categoriesPerPage = categories.value.slice(offset, limit);
    const isActive = categoriesPerPage.some((c) => c.categoryId == categorySelectedId);
    const page = {
      page: i + 1,
      items: categoriesPerPage,
      onPageChange: () => {
        currentCategoryPage.value = categoryPages.value![i];
      },
    };

    if (isActive) {
      currentCategoryPage.value = page;
    }

    pages.push(page);
  }

  categoryPages.value = pages;
};

const responsiveCategorySelect = (): void => {
  const screenWidth = window.innerWidth;
    const isMobile = screenWidth >= breakPoint.MOBILE && screenWidth < breakPoint.TABLET;
    const isTablet = screenWidth > breakPoint.TABLET && screenWidth < breakPoint.LARGE_TABLET;
    const isLargeTablet = screenWidth > breakPoint.LARGE_TABLET && screenWidth < breakPoint.DESKTOP;
    const isDesktop = screenWidth > breakPoint.DESKTOP && screenWidth < breakPoint.EXTRA_DESKTOP;
    const isExtraDesktop = screenWidth > breakPoint.EXTRA_DESKTOP;

    switch (true) {
      case isMobile: {
        return showCategories(3);
      };
      case isTablet: {
        return showCategories(6);
      };
      case isLargeTablet: {
        return showCategories(6);
      };
      case isDesktop: {
        return showCategories(7);
      };
      case isExtraDesktop: {
        return showCategories(10);
      };
      default: break;
    }
};

watch(categories, responsiveCategorySelect);

onMounted(() => {
  responsiveCategorySelect();
  window.addEventListener('resize', setTimeout(responsiveCategorySelect));
});
</script>

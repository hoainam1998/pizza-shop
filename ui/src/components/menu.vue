<template>
  <div class="menu-wrapper ps-display-flex ps-flex-direction-column ps-justify-content-space-between ps-bg-f39c12">
    <div class="ps-mt-10 ps-text-align-center">
      <RouterLink :to="paths.BASE.Path">
        <img src="@/assets/images/logo.png" height="40" width="40" />
      </RouterLink>
      <el-menu
        ref="menuRef"
        :default-active="`${paths.HOME}/${paths.HOME.CATEGORY}`"
        :router="true"
        :background-color="primaryColor"
        :active-text-color="primaryColor"
        :active-background-color="whiteColor"
        :text-color="whiteColor">
        <el-menu-item v-for="(item, index) in menuItems"
          :key="index"
          :index="item.index"
          class="ps-h-40px"
          @click="menuItemClick">
          <el-icon><component :is="item.icon"></component></el-icon>
          <template #title><span class="ps-fw-bold ps-text-transform-capitalize">{{ item.title }}</span></template>
        </el-menu-item>
      </el-menu>
    </div>
    <div>
      <el-image :src="url" fit="cover" class="ps-display-block ps-margin-auto ps-w-70px ps-h-70px" />
      <h5 class="ps-mt-5 ps-text-color-white ps-text-align-center ps-text-truncate-1 ps-px-7">
        Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur
        adipiscing elit quisque faucibus.
      </h5>
      <hr class="ps-mt-7" />
      <div class="ps-py-7 ps-text-align-center">
        <el-button size="small" type="primary" class="ps-fw-bold">Personal</el-button>
        <el-button size="small" type="danger" class="ps-fw-bold">Logout</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef, type Component } from 'vue';
import { RouterLink, onBeforeRouteUpdate, useRoute } from 'vue-router';
import { primaryColor, whiteColor } from '@/assets/scss/variables.module.scss';
import { Document, Menu as IconMenu, Burger } from '@element-plus/icons-vue';
import paths from '@/router/paths';
import useWrapperRouter from '@/composables/use-router';

const menuRef = useTemplateRef('menuRef');
const { push } = useWrapperRouter();
const url = 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg';
const route = useRoute();

type MenuItem = {
  icon: Component,
  title: string;
  index: string;
};

const indexes = [
  `${paths.HOME}/${paths.HOME.CATEGORY}`,
  `${paths.HOME}/${paths.HOME.INGREDIENT}`,
  `${paths.HOME}/${paths.HOME.PRODUCT}`,
];

const menuItems: MenuItem[] = [
  {
    title: 'category',
    icon: IconMenu,
    index: `${paths.HOME}/${paths.HOME.CATEGORY}`,
  },
  {
    title: 'ingredient',
    icon: Document,
    index: `${paths.HOME}/${paths.HOME.INGREDIENT}`,
  },
  {
    title: 'product',
    icon: Burger,
    index: `${paths.HOME}/${paths.HOME.PRODUCT}`,
  }
];

const menuItemClick = (menuItemProps: any): void => {
  push(menuItemProps.index);
};

onBeforeRouteUpdate((to) => {
  menuRef.value.updateActiveIndex(to.path);
});

onMounted(() => {
  const routeItem = route.matched.find((match) => indexes.includes(match.path));
  if (routeItem) {
    menuRef.value.updateActiveIndex(routeItem.path);
  }
});
</script>

<style lang="scss" scoped>
.menu-wrapper {
  height: 100vh;
  max-width: 200px;

  .is-active {
    background-color: v-bind(whiteColor);
  }
}
</style>

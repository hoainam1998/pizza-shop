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
        <el-menu-item
          @click="menuItemClick"
          :index="`${paths.HOME}/${paths.HOME.CATEGORY}`" class="ps-h-40px">
          <el-icon><icon-menu /></el-icon>
          <template #title><span style="font-weight: bold">Category</span></template>
        </el-menu-item>
        <el-menu-item
          @click="menuItemClick"
          :index="`${paths.HOME}/${paths.HOME.INGREDIENT}`" class="ps-h-40px">
          <el-icon><document /></el-icon>
          <template #title><span style="font-weight: bold">Ingredient</span></template>
        </el-menu-item>
        <el-menu-item
          @click="menuItemClick"
          :index="`${paths.HOME}/${paths.HOME.PRODUCT}`" class="ps-h-40px">
          <el-icon><setting /></el-icon>
          <template #title><span style="font-weight: bold">Product</span></template>
        </el-menu-item>
      </el-menu>
    </div>
    <div>
      <el-image style="width: 70px; height: 70px" :src="url" fit="cover" class="ps-display-block ps-margin-auto" />
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
import { onMounted, useTemplateRef } from 'vue';
import { RouterLink, onBeforeRouteUpdate, useRoute } from 'vue-router';
import { primaryColor, whiteColor } from '@/assets/scss/variables.module.scss';
import { Document, Menu as IconMenu, Setting } from '@element-plus/icons-vue';
import paths from '@/router/paths';
import useWrapperRouter from '@/composables/use-router';

const menuRef = useTemplateRef('menuRef');
const { push } = useWrapperRouter();
const url = 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg';
const route = useRoute();

const menuItemClick = (menuItemProps: any): void => {
  push(menuItemProps.index);
};

onBeforeRouteUpdate((to) => {
  menuRef.value.updateActiveIndex(to.path);
});

onMounted(() => {
  menuRef.value.updateActiveIndex(route.path);
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

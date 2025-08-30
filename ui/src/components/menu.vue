<template>
  <div class="menu-wrapper my-display-flex my-flex-direction-column my-justify-content-space-between my-bg-f39c12">
    <div class="my-mt-10 my-text-align-center">
      <RouterLink :to="paths.BASE">
        <img src="@/assets/images/logo.png" height="40" width="40" />
      </RouterLink>
      <el-menu default-active="1" :router="true" :background-color="primaryColor"
        :active-text-color="menuItemActiveColor" :text-color="whiteColor">
        <el-menu-item index="1" :route="paths.CATEGORY">
          <el-icon><icon-menu /></el-icon>
          <template #title><span style="font-weight: bold">Category</span></template>
        </el-menu-item>
        <el-menu-item index="2">
          <el-icon>
            <document />
          </el-icon>
          <template #title>Navigator Three</template>
        </el-menu-item>
        <el-menu-item index="3">
          <el-icon>
            <setting />
          </el-icon>
          <template #title>Navigator Four</template>
        </el-menu-item>
      </el-menu>
    </div>
    <div>
      <el-image style="width: 70px; height: 70px" :src="url" fit="cover" class="my-display-block my-margin-auto" />
      <h5 class="my-mt-5 my-text-color-white my-text-align-center my-text-truncate-1 my-px-7">
        Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur
        adipiscing elit quisque faucibus.
      </h5>
      <hr class="my-mt-7" />
      <div class="my-py-7 my-text-align-center">
        <el-button size="small" type="primary" class="my-fw-bold">Personal</el-button>
        <el-button size="small" type="danger" class="my-fw-bold">Logout</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { primaryColor, whiteColor, menuItemActiveColor } from '@/assets/scss/variables.module.scss';
import { Document, Menu as IconMenu, Setting } from '@element-plus/icons-vue';
import paths from '@/router/paths';
const url = 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg';
</script>

<style lang="scss" scoped>
.menu-wrapper {
  height: 100vh;
  max-width: 200px;
}
</style>

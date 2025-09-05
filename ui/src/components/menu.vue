<template>
  <div class="menu-wrapper ps-display-flex ps-flex-direction-column ps-justify-content-space-between ps-bg-f39c12">
    <div class="ps-mt-10 ps-text-align-center">
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

<template>
  <section v-not-found-frame-height class="not-found ps-display-flex ps-align-items-center ps-justify-content-center">
    <div class="ps-display-flex ps-flex-direction-column ps-align-items-center">
      <img :src="pageNotFound" alt="page-not-found" width="50%" height="50%" />
      <h4 class="ps-my-10">Page not found!</h4>
      <el-button type="primary" @click="backToHome">
        <el-icon>
          <Back />
        </el-icon>&nbsp;
        Back to home!
      </el-button>
    </div>
  </section>
</template>
<script setup lang="ts">
import pageNotFound from '@/assets/images/page-not-found.png';
import { Back } from '@element-plus/icons-vue';
import useWrapperRouter from '@/composables/use-router';
import paths from '@/router/paths';

const { push } = useWrapperRouter();

const backToHome = () => push(paths.BASE);

const vNotFoundFrameHeight = {
  mounted: (el: HTMLElement): void => {
    const siblingHeight = el.previousElementSibling?.clientHeight;
    el.style.height = `calc(100vh - ${siblingHeight}px)`;
  },
};
</script>

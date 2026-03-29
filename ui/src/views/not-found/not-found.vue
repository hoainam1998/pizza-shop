<template>
  <section class="not-found ps-h-100vh ps-display-flex ps-align-items-center ps-justify-content-center">
    <div class="ps-display-flex ps-flex-direction-column ps-align-items-center">
      <img :src="pageNotFound" alt="page-not-found" width="50%" height="50%" />
      <h4 class="ps-my-10">Page not found!</h4>
      <BackButton />
    </div>
  </section>
</template>
<script setup lang="ts">
import pageNotFound from '@/assets/images/page-not-found.png';
import BackButton from '@/components/common/buttons/back-button/back-button.vue';
</script>

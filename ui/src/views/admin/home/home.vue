<template>
  <div class="admin-home ps-display-grid">
    <section class="ps-w-200px">
      <div class="ps-position-fixed
      ps-display-flex
      ps-flex-direction-column
      ps-justify-content-space-between
      ps-w-200px
      ps-h-100vh">
        <Menu />
        <PersonalBox />
      </div>
    </section>
    <section>
      <div class="ps-mb-25"><Breadcrumb :lastName="routerName.name" /></div>
      <router-view class="ps-mt-30" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, provide } from 'vue';
import { RouterView, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router';
import Menu from '@/components/admin/menu/menu.vue';
import PersonalBox from '@/components/admin/personal-box/personal-box.vue';
import Breadcrumb from '@/components/admin/breadcrumb.vue';
import { ROUTE_NAME } from '@/di-token';

const routerName = reactive({
  name: '',
  setName: function (value: string) {
    this.name = value;
  }
});

provide(ROUTE_NAME, routerName);

onBeforeRouteUpdate(() => routerName.setName(''));
onBeforeRouteLeave(() => routerName.setName(''));
</script>
<style lang="scss" scoped>
.admin-home {
  grid-template-columns: 200px calc(100vw - 200px - 14px);
  grid-column-gap: 14px;
}
</style>

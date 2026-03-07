<template>
  <div class="admin-home ps-display-grid">
    <section class="ps-w-200px">
      <Menu />
    </section>
    <div>
      <Breadcrumb :lastName="routerName.name" />
      <router-view class="ps-mt-30"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, provide } from 'vue';
import { RouterView, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router';
import Menu from '@/components/admin/menu.vue';
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
  grid-template-columns: 200px calc(100vw - 200px);
  grid-column-gap: 14px;
}
</style>
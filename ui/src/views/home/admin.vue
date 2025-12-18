<template>
  <div class="ps-display-flex ps-flex-gap-7">
    <Menu />
    <div class="ps-w-100">
      <Breadcrumb :lastName="routerName.name" />
      <router-view />
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
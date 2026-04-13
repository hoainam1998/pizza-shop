<template>
  <div class="menu-wrapper
  ps-w-200px
  ps-h-75vh
  ps-display-flex
  ps-flex-direction-column
  ps-justify-content-space-between">
    <div class="ps-text-align-center">
      <RouterLink :to="paths.BASE.Path" class="ps-display-block ps-line-height-16 ps-bg-2ecc71 ps-py-5 ps-w-100">
        <div class="ps-py-4 ps-px-4 ps-bg-white ps-display-inline-block ps-border-radius-3">
          <img src="@/assets/images/logo.png" height="40" width="40" class="ps-box-shadow" />
        </div>
      </RouterLink>
      <el-menu
        ref="menuRef"
        :default-active="`${paths.HOME}/${paths.HOME.CATEGORY}`"
        :router="true"
        :background-color="primaryColor"
        :active-text-color="primaryColor"
        :active-background-color="whiteColor"
        :text-color="whiteColor"
        class="menu-items ps-bg-f39c12 ps-overflow-y-auto">
        <List :items="menuItems">
          <template #default="{ item }">
            <el-menu-item :index="item.index" class="ps-h-40px" @click="menuItemClick">
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <template #title><span class="ps-fw-bold ps-text-transform-capitalize">{{ item.title }}</span></template>
            </el-menu-item>
          </template>
        </List>
      </el-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onMounted, useTemplateRef, type Component, ref, type Ref, shallowRef } from 'vue';
import { RouterLink, onBeforeRouteUpdate, useRoute } from 'vue-router';
import { primaryColor, whiteColor } from '@/assets/scss/variables.module.scss';
import { Document, Menu as IconMenu, Burger, Tickets, User } from '@element-plus/icons-vue';
import List from '@/components/common/list.vue';
import { auth as authStore } from '@/store';
import paths from '@/router/paths';
import { POWER } from '@/enums';
import useWrapperRouter from '@/composables/use-router';

const menuRef = useTemplateRef('menuRef');
const { push } = useWrapperRouter();
const route = useRoute();
const userPower = authStore.getUserPower();

type MenuItem = {
  icon: Component,
  title: string;
  index: string;
};

const userMenuItems: MenuItem[] = [
  {
    title: 'user',
    icon: shallowRef(User),
    index: `${paths.HOME}/${paths.HOME.USER}`,
  },
  {
    title: 'report',
    icon: shallowRef(Tickets),
    index: `${paths.HOME}/${paths.HOME.REPORT}`,
  }
];

const menuItems: Ref<MenuItem[]> = ref([
  {
    title: 'category',
    icon: shallowRef(IconMenu),
    index: `${paths.HOME}/${paths.HOME.CATEGORY}`,
  },
  {
    title: 'ingredient',
    icon: shallowRef(Document),
    index: `${paths.HOME}/${paths.HOME.INGREDIENT}`,
  },
  {
    title: 'product',
    icon: shallowRef(Burger),
    index: `${paths.HOME}/${paths.HOME.PRODUCT}`,
  }
]);

const menuPaths: string[] = menuItems.value.map((item) => item.index);

const menuItemClick = (menuItemProps: MenuItem): void => {
  push(menuItemProps.index);
};

onBeforeRouteUpdate((to) => {
  menuRef.value.updateActiveIndex(to.path);
});

onBeforeMount(() => {
  if (userPower === POWER.SUPER_ADMIN) {
    menuItems.value = menuItems.value.concat(userMenuItems);
  }
});

onMounted(() => {
  const routeItem = route.matched.find((match) => menuPaths.includes(match.path));
  if (routeItem) {
    menuRef.value.updateActiveIndex(routeItem.path);
  }
});
</script>

<style lang="scss" scoped>
.menu-wrapper {
  .is-active {
    background-color: v-bind(whiteColor);
  }

  .menu-items {
    height: calc(75vh - 50px);
  }
}
</style>

import type { RouterOptions } from 'vue-router';
import NotFound from '@/views/not-found/not-found.vue';
import paths from '@/router/paths';

export default [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
  },
  {
    path: `${paths.BASE}`,
    redirect: 'login',
  },
] as RouterOptions['routes'];

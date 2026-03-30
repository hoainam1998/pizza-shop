import type { RouterOptions } from 'vue-router';
import NotFound from '@/views/not-found/not-found.vue';

export default [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
  },
] as RouterOptions['routes'];

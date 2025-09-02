import type { RouterOptions } from 'vue-router';
import paths from './paths';
import Category from '@/views/category.vue';
import Home from '@/views/home.vue';

const adminRoutes: RouterOptions['routes'] = [
  {
    path: paths.BASE,
    name: 'home',
    component: Home,
    redirect: 'category',
    children: [
      {
        path: paths.CATEGORY,
        name: 'category',
        component: Category,
      },
    ],
  },
];

export default adminRoutes;

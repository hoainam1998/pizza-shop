import type { RouterOptions } from 'vue-router';
import All from '@/views/sale/all/all.vue';
import Cart from '@/views/sale/cart/cart.vue';
import Home from '@/views/sale/home/home.vue';
import paths from '@/router/paths';

const saleRoutes: RouterOptions['routes'] = [
  {
    path: `${paths.HOME}`,
    name: 'home',
    component: Home,
    children: [
      {
        path: '',
        name: 'all',
        component: All,
      },
      {
        path: `${paths.CART}`,
        name: 'cart',
        component: Cart,
      },
    ],
  },
];

export default saleRoutes;

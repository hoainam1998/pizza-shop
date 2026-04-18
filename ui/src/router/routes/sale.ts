import type { RouterOptions } from 'vue-router';
import All from '@/views/sale/all/all.vue';
import Cart from '@/views/sale/cart/cart.vue';
import Home from '@/views/sale/home/home.vue';
import paths from '@/router/paths';
import names from '@/router/names';

const saleRoutes: RouterOptions['routes'] = [
  {
    path: `${paths.HOME}`,
    name: names.Home,
    component: Home,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: names.AllProduct,
        component: All,
      },
      {
        path: `${paths.CART}`,
        name: names.Cart,
        component: Cart,
      },
    ],
  },
];

export default saleRoutes;

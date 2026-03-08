import type { RouterOptions } from 'vue-router';
import SaleHome from '@/views/sale/home/home.vue';
import Cart from '@/views/sale/cart/cart.vue';
import NotFound from '@/views/not-found/not-found.vue';
import paths from '@/router/paths';

const saleRoutes: RouterOptions['routes'] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
  },
  {
    path: `${paths.BASE}`,
    name: 'home',
    component: SaleHome,
  },
  {
    path: `${paths.CART}`,
    name: 'cart',
    component: Cart,
  },
];

export default saleRoutes;

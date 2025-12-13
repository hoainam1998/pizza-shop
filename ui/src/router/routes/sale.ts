import type { RouterOptions } from 'vue-router';
import SaleHome from '@/views/home/sale.vue';
import Cart from '@/views/sale/cart.vue';
import paths from '../paths';

const saleRoutes: RouterOptions['routes'] = [
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

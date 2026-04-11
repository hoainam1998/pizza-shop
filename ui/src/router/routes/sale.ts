import type { RouterOptions } from 'vue-router';
import All from '@/views/sale/all/all.vue';
import Cart from '@/views/sale/cart/cart.vue';
import Personal from '@/views/sale/personal/personal.vue';
import Home from '@/views/sale/home/home.vue';
import Login from '@/views/sale/login-group/login/login.vue';
import ResetPassword from '@/views/sale/login-group/reset-password/reset-password.vue';
import paths from '@/router/paths';

const saleRoutes: RouterOptions['routes'] = [
  {
    path: `${paths.LOGIN}`,
    name: 'login',
    component: Login,
  },
  {
    path: `${paths.PERSONAL}`,
    name: 'personal',
    component: Personal,
  },
  {
    path: `${paths.RESET_PASSWORD}`,
    name: 'reset_password',
    component: ResetPassword,
  },
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

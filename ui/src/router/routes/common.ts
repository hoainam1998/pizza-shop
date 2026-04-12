import type { RouterOptions } from 'vue-router';
import NotFound from '@/views/not-found/not-found.vue';
import AdminLogin from '@/views/admin/login-group/login/login.vue';
import SaleLogin from '@/views/sale/login-group/login/login.vue';
import AdminResetPassword from '@/views/admin/login-group/reset-password/reset-password.vue';
import SaleResetPassword from '@/views/sale/login-group/reset-password/reset-password.vue';
import AdminPersonal from '@/views/admin/personal/personal.vue';
import SalePersonal from '@/views/sale/personal/personal.vue';
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
  {
    path: `${paths.LOGIN}`,
    name: 'login',
    component: isSale ? SaleLogin : AdminLogin,
  },
  {
    path: `${paths.RESET_PASSWORD}`,
    name: 'reset_password',
    component: isSale ? SaleResetPassword : AdminResetPassword,
  },
  {
    path: `${paths.PERSONAL}`,
    name: 'personal',
    component: isSale ? SalePersonal : AdminPersonal,
    meta: { requiresAuth: true },
  },
] as RouterOptions['routes'];

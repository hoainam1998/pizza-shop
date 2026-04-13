import type { RouterOptions } from 'vue-router';
import NotFound from '@/views/not-found/not-found.vue';
import AdminLogin from '@/views/admin/login-group/login/login.vue';
import SaleLogin from '@/views/sale/login-group/login/login.vue';
import AdminResetPassword from '@/views/admin/login-group/reset-password/reset-password.vue';
import SaleResetPassword from '@/views/sale/login-group/reset-password/reset-password.vue';
import AdminPersonal from '@/views/admin/personal/personal.vue';
import SalePersonal from '@/views/sale/personal/personal.vue';
import paths from '@/router/paths';
import names from '@/router/names';

export default [
  {
    path: '/:pathMatch(.*)*',
    name: names.NotFound,
    component: NotFound,
  },
  {
    path: `${paths.BASE}`,
    redirect: names.Login,
  },
  {
    path: `${paths.LOGIN}`,
    name: names.Login,
    component: isSale ? SaleLogin : AdminLogin,
  },
  {
    path: `${paths.RESET_PASSWORD}`,
    name: names.ResetPassword,
    component: isSale ? SaleResetPassword : AdminResetPassword,
  },
  {
    path: `${paths.PERSONAL}`,
    name: names.Personal,
    component: isSale ? SalePersonal : AdminPersonal,
    meta: { requiresAuth: true },
  },
] as RouterOptions['routes'];

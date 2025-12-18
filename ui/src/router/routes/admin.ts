import { RouterView } from 'vue-router';
import type { RouterOptions } from 'vue-router';
import paths from '../paths';
import Category from '@/views/admin/category-group/category.vue';
import Home from '@/views/home/admin.vue';
import Signup from '@/views/login-group/signup.vue';
import ResetPassword from '@/views/login-group/reset-password.vue';
import Login from '@/views/login-group/login.vue';
import ProductDetail from '@/views/admin/product-group/detail/detail.vue';
import ProductList from '@/views/admin/product-group/list/list.vue';
import IngredientList from '@/views/admin/ingredient-group/list/list.vue';

const adminRoutes: RouterOptions['routes'] = [
  {
    path: `${paths.BASE}`,
    redirect: 'login',
  },
  {
    path: `${paths.LOGIN}`,
    name: 'login',
    component: Login,
  },
  {
    path: `${paths.HOME}`,
    name: 'home',
    component: Home,
    redirect: 'category',
    meta: { requiresAuth: true },
    children: [
      {
        path: `${paths.HOME.CATEGORY}`,
        name: 'category',
        component: Category,
      },
      {
        path: `${paths.HOME.PRODUCT}`,
        name: 'products',
        component: RouterView,
        children: [
          {
            path: '',
            name: 'product_list',
            props: {
              notShowBreadcrumb: true,
            },
            component: ProductList,
          },
          {
            path: `${paths.HOME.PRODUCT.NEW}`,
            component: ProductDetail,
            name: 'new',
          },
          {
            path: `${paths.ID}`,
            component: ProductDetail,
          },
        ],
      },
      {
        path: `${paths.HOME.INGREDIENT}`,
        name: 'ingredients',
        component: RouterView,
        children: [
          {
            path: '',
            name: 'ingredient_list',
            props: {
              notShowBreadcrumb: true,
            },
            component: IngredientList,
          },
        ],
      },
    ],
  },
  {
    path: `${paths.SIGNUP}`,
    name: 'signup',
    component: Signup,
  },
  {
    path: `${paths.RESET_PASSWORD}`,
    name: 'reset_password',
    component: ResetPassword,
  },
];

export default adminRoutes;

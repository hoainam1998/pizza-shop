import { RouterView } from 'vue-router';
import type { RouterOptions } from 'vue-router';
import paths from '../paths';
import Category from '@/views/admin/category-group/category.vue';
import Home from '@/views/admin/home/home.vue';
import Signup from '@/views/admin/login-group/signup/signup.vue';
import ProductDetail from '@/views/admin/product-group/detail/detail.vue';
import ProductList from '@/views/admin/product-group/list/list.vue';
import IngredientList from '@/views/admin/ingredient-group/list/list.vue';
import UserList from '@/views/admin/user-group/list/list.vue';
import UserDetail from '@/views/admin/user-group/detail/detail.vue';
import Report from '@/views/admin/report/report.vue';

const adminRoutes: RouterOptions['routes'] = [
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
      {
        path: `${paths.HOME.USER}`,
        name: 'user',
        component: RouterView,
        children: [
          {
            path: '',
            name: 'user_list',
            props: {
              notShowBreadcrumb: true,
            },
            component: UserList,
          },
          {
            path: 'new',
            name: 'user_create',
            component: UserDetail,
          },
          {
            path: `${paths.HOME.USER.ID}`,
            name: 'user_update',
            component: UserDetail,
          },
        ],
      },
      {
        path: `${paths.HOME.REPORT}`,
        name: 'report',
        component: Report,
      },
    ],
  },
  {
    path: `${paths.SIGNUP}`,
    name: 'signup',
    component: Signup,
  },
];

export default adminRoutes;

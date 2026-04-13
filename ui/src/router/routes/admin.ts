import { RouterView } from 'vue-router';
import type { RouterOptions } from 'vue-router';
import paths from '@/router/paths';
import names from '@/router/names';
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
        name: names.Category,
        component: Category,
      },
      {
        path: `${paths.HOME.PRODUCT}`,
        name: names.Product,
        component: RouterView,
        children: [
          {
            path: '',
            name: names.ProductList,
            props: {
              notShowBreadcrumb: true,
            },
            component: ProductList,
          },
          {
            path: `${paths.HOME.PRODUCT.NEW}`,
            component: ProductDetail,
            name: names.ProductCreate,
          },
          {
            path: `${paths.ID}`,
            name: names.ProductUpdate,
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
            name: names.IngredientList,
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
            name: names.UserList,
            props: {
              notShowBreadcrumb: true,
            },
            component: UserList,
          },
          {
            path: 'new',
            name: names.UserCreate,
            component: UserDetail,
          },
          {
            path: `${paths.HOME.USER.ID}`,
            name: names.UserUpdate,
            component: UserDetail,
          },
        ],
      },
      {
        path: `${paths.HOME.REPORT}`,
        name: names.Report,
        component: Report,
      },
    ],
  },
  {
    path: `${paths.SIGNUP}`,
    name: names.Signup,
    component: Signup,
  },
];

export default adminRoutes;

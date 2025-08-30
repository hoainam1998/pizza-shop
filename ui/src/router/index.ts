import { createRouter, createWebHistory } from 'vue-router';
import adminRoutes from './admin-routes';
import saleRoutes from './sale-routes';

const routes = globalThis.isSale ? saleRoutes : adminRoutes;

const router = createRouter({
  history: createWebHistory(process.env.ROUTER_BASE_URL),
  routes: routes,
});

export default router;

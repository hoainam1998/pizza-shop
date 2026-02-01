import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import guard from './guards';

const router = createRouter({
  history: createWebHistory(process.env.ROUTER_BASE_URL),
  routes,
});

router.beforeEach(guard);

export default router;

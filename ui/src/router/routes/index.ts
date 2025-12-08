import adminRoutes from './admin';
import saleRoutes from './sale';

export default globalThis.isSale ? saleRoutes : adminRoutes;

import adminRoutes from './admin';
import saleRoutes from './sale';

export default isSale ? saleRoutes : adminRoutes;

import adminRoutes from './admin';
import saleRoutes from './sale';
import common from './common';

const routes =  isSale ? saleRoutes : adminRoutes;

export default common.concat(routes);

import adminGuard from './admin';
import saleGuard from './sale';

export default  isSale ? saleGuard : adminGuard;;

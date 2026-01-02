import RouterBase from '../base';

/**
 * Regis route path.
 *
 * @extends RouterBase
 * @class
 */
export default class ProductRouter extends RouterBase {
  protected static readonly baseUrl = 'product';
  static relative: Record<string, string> = {};
  static absolute: Record<string, string> = {};

  constructor() {
    super();
    ProductRouter.createRouterPath('create');
    ProductRouter.createRouterPath('update');
    ProductRouter.createRouterPath('pagination');
    ProductRouter.createRouterPath('pagination-for-sale');
    ProductRouter.createRouterPath('products-in-cart');
    ProductRouter.createRouterPath('detail');
    ProductRouter.createRouterPath('delete', ':id');
  }
}

new ProductRouter();

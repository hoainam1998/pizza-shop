import RouterBase from '../base';

/**
 * Regis route path.
 *
 * @extends RouterBase
 * @class
 */
export default class CategoryRouter extends RouterBase {
  protected static readonly baseUrl = 'category';
  static relative: Record<string, string> = {};
  static absolute: Record<string, string> = {};

  constructor() {
    super();
    CategoryRouter.createRouterPath('create');
    CategoryRouter.createRouterPath('update');
    CategoryRouter.createRouterPath('pagination');
    CategoryRouter.createRouterPath('detail');
    CategoryRouter.createRouterPath('all');
    CategoryRouter.createRouterPath('delete', ':id');
  }
}

new CategoryRouter();

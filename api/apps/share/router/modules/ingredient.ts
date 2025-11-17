import RouterBase from '../base';

/**
 * Regis route path.
 *
 * @extends RouterBase
 * @class
 */
export default class IngredientRouter extends RouterBase {
  protected static readonly baseUrl = 'ingredient';
  static relative: Record<string, string> = {};
  static absolute: Record<string, string> = {};

  constructor() {
    super();
    IngredientRouter.createRouterPath('update');
    IngredientRouter.createRouterPath('detail');
    IngredientRouter.createRouterPath('create');
    IngredientRouter.createRouterPath('computed-product-price');
    IngredientRouter.createRouterPath('delete', ':id');
    IngredientRouter.createRouterPath('all');
    IngredientRouter.createRouterPath('pagination');
  }
}

new IngredientRouter();

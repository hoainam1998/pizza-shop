import RouterBase from '../base';

/**
 * Regis route path.
 *
 * @extends RouterBase
 * @class
 */
export default class UserRouter extends RouterBase {
  protected static readonly baseUrl = 'user';
  static relative: Record<string, string> = {};
  static absolute: Record<string, string> = {};

  constructor() {
    super();
    UserRouter.createRouterPath('can-signup');
    UserRouter.createRouterPath('signup');
    UserRouter.createRouterPath('login');
    UserRouter.createRouterPath('logout');
    UserRouter.createRouterPath('reset-password');
    UserRouter.createRouterPath('create');
    UserRouter.createRouterPath('pagination');
    UserRouter.createRouterPath('detail');
    UserRouter.createRouterPath('update');
    UserRouter.createRouterPath('update-power');
    UserRouter.createRouterPath('update-personal-info');
    UserRouter.createRouterPath('delete', ':userId');
  }
}

new UserRouter();

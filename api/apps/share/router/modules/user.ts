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
    UserRouter.createRouterPath('reset-password');
  }
}

new UserRouter();

import RouterBase from '../base';

/**
 * Regis healthy route path.
 *
 * @extends RouterBase
 * @class
 */
export default class HealthyRouter extends RouterBase {
  protected static readonly baseUrl = 'healthy';
  static relative: Record<string, string> = {};
  static absolute: Record<string, string> = {};
}

new HealthyRouter();

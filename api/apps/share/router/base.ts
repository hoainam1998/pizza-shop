import Route from './route';

const convertHyphenToCamelCasePath = (path: string): string => {
  const pathSeparate = path.split('-');
  if (pathSeparate.length > 1) {
    return pathSeparate.reduce((newPath, word, index) => {
      if (index > 0) {
        newPath += word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        newPath += word;
      }
      return newPath;
    }, '');
  }
  return path;
};

/**
 * Assign unreplaced property.
 *
 * @param {object} target - The target object.
 * @param {string} prop - The prop name.
 * @param {string} value - The prop value.
 * @returns {object} - The destination object.
 */
const assign = (target: Record<string, string>, prop: string, value: any): any => {
  return Object.defineProperty(target, convertHyphenToCamelCasePath(prop), {
    value,
    enumerable: false,
    writable: false,
    configurable: false,
  });
};

/**
 * Help classing absolute and relative path.
 * @class
 */
export default class RouterBase {
  protected static relative: Record<string, string> = {};
  protected static absolute: Record<string, string> = {};

  protected static readonly baseUrl: string;

  static get BaseUrl() {
    return this.baseUrl;
  }

  /**
   * Regis a route path.
   *
   * @param {string} childPath - The sub route path.
   * @static
   */
  static createRouterPath(childPath: string, grandChildPath?: string): void {
    const router = new Route(this.baseUrl, childPath, grandChildPath);
    this.absolute = assign(this.absolute, childPath, router.absolute);
    this.relative = assign(this.relative, childPath, router.relative);
  }
}

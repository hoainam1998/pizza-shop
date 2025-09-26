/**
 * Validate route path.
 * @param {RouterPath} routerPath - The RouterPath.
 * @param {string[]} invalidPaths - The invalid paths.
 * @returns {boolean} - The validate result.
 */
const validatePath = (routerPath: Record<string, RouterPath>, invalidPaths: string[]): boolean => {
  return Object.values(routerPath).every((path) => {
    if (!/(^:?\w+|^\/$)/.test(path.Path)) {
      invalidPaths.push(path.Path);
      return false;
    } else {
      if (path.Children) {
        return validatePath(path.Children, invalidPaths);
      }
      return true;
    }
  });
};

/**
 * Merging child route to parent.
 * @param {RouterPath} routerPath - The RouterPath.
 * @returns {Record<string, RouterPath>} - The child RouterPath.
 */
const mergingChildRoute = (routerPath: Record<string, RouterPath>): Record<string, RouterPath> => {
  return Object.entries(routerPath).reduce<Record<string, any>>((o, [key, value]) => {
    o[key] = {
      value,
      writeable: false,
      configurable: false,
      enumerable: false,
    };
    return o;
  }, {});
};

/**
 * Organization and validate route path.
 * @class
 */
class RouterPath {
  [x: string]: any;
  private _path: string;
  private _children?: Record<string, RouterPath>;

  /**
   *
   * @constructor
   * @param {string} path - The route path.
   * @param {Record<string, RouterPath>} children - The child route path.
   */
  constructor(path: string, children?: Record<string, RouterPath>) {
    this._path = path;
    if (children) {
      this.Children = children;
    }
  }

  set Path(value: string) {
    if (/^\/$|(^\/?\w+)/.test(value)) {
      this._path = value;
    } else {
      throw new Error('[Route Path] Parent path must must include "/" at start of path!');
    }
  }

  get Path() {
    return this._path;
  }

  set Children(value: Record<string, RouterPath>) {
    const invalidPaths: string[] = [];
    const resultValidate = validatePath(value, invalidPaths);

    if (resultValidate) {
      this._children = value;
      const childObj = mergingChildRoute(value);
      Object.defineProperties(this, childObj);
    } else {
      throw new Error(`[Route Path] ${invalidPaths.join(', ')} must be the children's rout path!`);
    }
  }

  get Children(): Record<string, RouterPath> | undefined {
    return this._children;
  }

  [Symbol.toPrimitive](hint: string): string | typeof this.Children {
    if (hint === 'string') {
      return this.Path;
    }
    return this.Children;
  }
}

export default RouterPath;

/**
 * Organization and validate route path.
 * @class
 */
class RouterPath {
  [x: string]: any;
  private _path: string;
  private _children?: Record<string, string>;

  /**
   *
   * @constructor
   * @param {string} path - The route path.
   * @param {Record<string, string>} children - The child route path.
   */
  constructor(path: string, children?: Record<string, string>) {
    this._path = path;
    if (children) {
      this.Children = children;
    }
  }

  set Path(value: string) {
    if (/^\/$|(^\/\w+)/.test(value)) {
      this._path = value;
    } else {
      throw new Error('[Route Path] Parent path must must include "/" at start of path!');
    }
  }

  get Path() {
    return this._path;
  }

  set Children(value: Record<string, string>) {
    const invalidPaths: string[] = [];
    const resultValidate = Object.values(value).every((path) => {
      if (!/(^:?\w+|^\/$)/.test(path)) {
        invalidPaths.push(path);
        return false;
      }
      return true;
    });

    if (resultValidate) {
      this._children = value;
      const childObj = Object.entries(this._children)
        .reduce<Record<string, any>>((o, [key, value]) => {
          o[key] = {
            value,
            writeable: false,
            configurable: false,
            enumerable: false,
          };
          return o;
        }, {});
      Object.defineProperties(this, childObj);
    } else {
      throw new Error(`[Route Path] ${invalidPaths.join(', ')} must be the children's rout path!`);
    }
  }

  get Children(): Record<string, string> | undefined {
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

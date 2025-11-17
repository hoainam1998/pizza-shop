/**
 * Define route path.
 * @class
 */
export default class Route {
  private _baseUrl: string;
  private _childPath: string;
  private _grandChildPath?: string;

  constructor(baseUrl: string, childPath: string, grandChildPath?: string) {
    this._baseUrl = baseUrl;
    this._childPath = childPath;
    this._grandChildPath = grandChildPath;
  }

  get absolute() {
    return `/${this._baseUrl}/${this._childPath}`;
  }

  get relative() {
    return this._grandChildPath ? `${this._childPath}/${this._grandChildPath}` : this._childPath;
  }
}

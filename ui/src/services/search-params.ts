export default class SearchParams {
  private _urlInstance: URL;
  private static _itSelf: SearchParams;

  constructor() {
    this._urlInstance = new URL(window.location.href);
  }

  get Url() {
    return this._urlInstance;
  }

  static create() {
    this._itSelf = new SearchParams();
  }

  static get(key: string): string | null {
    return this._itSelf.Url.searchParams.get(key);
  }
}

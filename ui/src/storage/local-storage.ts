import Storage from './storage';

/**
 * Localstorage class.
 * @class
 * @extends Storage
 */
class LocalStorage extends Storage {

  setItem(data: any): void {
    localStorage.setItem(this._name, JSON.stringify(data));
  }

  getItem(): any {
    return JSON.parse(localStorage.getItem(this._name)!);
  }

  removeItem(): void {
    localStorage.removeItem(this._name);
  }
}

export const CurrentRouteStorage = new LocalStorage('current-route');
export const UserLoggedTokenStorage = new LocalStorage('user-logged-token');
export const ApiKeyStorage = new LocalStorage('api-key');

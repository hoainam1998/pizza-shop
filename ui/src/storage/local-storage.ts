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

export const AuthStorage = new LocalStorage('apiKey');

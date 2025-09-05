import Storage from './storage';

/**
 * Session storage class.
 * @class
 * @extends Storage
 */
class SessionStorage extends Storage {

  setItem(data: any): void {
    sessionStorage.setItem(this._name, JSON.stringify(data));
  }

  getItem(): any {
    return JSON.parse(sessionStorage.getItem(this._name)!);
  }

  removeItem(): void {
    sessionStorage.removeItem(this._name);
  }
}

export const AuthStorage = new SessionStorage('auth');

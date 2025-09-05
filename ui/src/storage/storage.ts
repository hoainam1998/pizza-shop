/**
 * Storage class.
 * @class
 */
abstract class Storage {
  protected _name: string;

  constructor(name: string) {
    this._name = name;
  }

  /**
   * Save data in storage.
   *
   * @param {*} data - The storage data.
   */
  abstract setItem(data: any): void;

  /**
   * Return data in storage.
   *
   * @returns {*} - The data returned from storage.
   */
  abstract getItem(): any;

  /**
   * Remove storage item.
   */
  abstract removeItem(): void;
}

export default Storage;

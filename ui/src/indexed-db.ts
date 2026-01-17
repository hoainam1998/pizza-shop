import { OBJECT_STORE_NAME } from '@/enums';
/**
 * Transfer request chain to promise chain.
 *
 * @param {
 * IDBRequest<IDBValidKey> | IDBRequest<IDBValidKey[]> | IDBRequest<number> | IDBRequest<undefined>
 * } request - An indexedDb request.
 * @param {(value: any) => void} resolve - The promise resolve.
 * @param {(error: any) => void} reject - The promise request.
 */
const handleRequestAsPromise = (
  request: IDBRequest<IDBValidKey> | IDBRequest<IDBValidKey[]> | IDBRequest<number> | IDBRequest<undefined>,
  resolve: (value: any) => void,
  reject: (error: any) => void,
) => {
  request.onsuccess = (event: any) => resolve(event.target.result);
  request.onerror = (event: any) => reject(event.target.error);
};

/**
 * setTimeout delay.
 */
const DELAY = 100;

/**
 * IndexedDb helper class.
 * @class
 */
export default class IndexedDb {
  private static readonly _itSelf: IndexedDb = new IndexedDb();
  private _request?: IDBOpenDBRequest;
  private readonly _version: number = 1;
  private readonly _objectStoreName: string = OBJECT_STORE_NAME.CARTS;
  private readonly _dbName: string = 'pizza-carts';
  private _dbObject?: IDBDatabase;
  private _add?: (objectStoreName: string, payload: any) => IDBRequest<IDBValidKey>;
  private _update?: (objectStoreName: string, payload: any) => IDBRequest<IDBValidKey>;
  private _delete?: (objectStoreName: string, key: string) => IDBRequest<undefined>;
  private _get?: (objectStoreName: string, key: string | number) => IDBRequest<IDBValidKey>;
  private _getAllKeys?: (objectStoreName: string) => IDBRequest<IDBValidKey[]>;
  private _getAll?: (objectStoreName: string) => IDBRequest<IDBValidKey[]>;
  private _count?: (objectStoreName: string) => IDBRequest<number>;

  constructor() {
    if (!IndexedDb._itSelf) {
      this._request = indexedDB.open(this._dbName, this._version);
      this.createObjectStore();
      this.completing();
    }
  }

  /**
   * Create object store.
   * @private
   */
  private createObjectStore(): void {
    if (this._request) {
      this._request.onupgradeneeded = (event: any): void => {
        const db: IDBDatabase = event.target.result;
        const objectStore = db.createObjectStore(this._objectStoreName, { keyPath: 'productId' });
        objectStore.createIndex('productId', 'productId', { unique: true });
      };
    }
  }

  /**
   * Integrate all behavior functions when database connect success.
   * @private
   */
  private completing(): void {
    if (this._request) {
      this._request.onsuccess = (event: any): void => {
        this._dbObject = event.target.result;
        this._add = (objectStoreName: string, payload: any): IDBRequest<IDBValidKey> => {
          const transaction = this._dbObject!.transaction([this._objectStoreName], 'readwrite');
          const objectStore = transaction.objectStore(objectStoreName);
          return objectStore.add(payload);
        };
        this._update = (objectStoreName: string, payload: any): IDBRequest<IDBValidKey> => {
          const transaction = this._dbObject!.transaction([this._objectStoreName], 'readwrite');
          const objectStore = transaction.objectStore(objectStoreName);
          return objectStore.put(payload);
        };
        this._delete = (objectStoreName: string, key: string): IDBRequest<undefined> => {
          const transaction = this._dbObject!.transaction([this._objectStoreName], 'readwrite');
          const objectStore = transaction.objectStore(objectStoreName);
          return objectStore.delete(key);
        };
        this._get = (objectStoreName: string, key: string | number): IDBRequest<IDBValidKey> => {
          const transaction = this._dbObject!.transaction([this._objectStoreName]);
          const objectStore = transaction.objectStore(objectStoreName);
          return objectStore.get(key);
        };
        this._getAllKeys = (objectStoreName: string): IDBRequest<IDBValidKey[]> => {
          const transaction = this._dbObject!.transaction([this._objectStoreName], 'readonly');
          const objectStore = transaction.objectStore(objectStoreName);
          const index = objectStore.index('productId');
          return index.getAllKeys();
        };
        this._getAll = (objectStoreName: string): IDBRequest<IDBValidKey[]> => {
          const transaction = this._dbObject!.transaction([this._objectStoreName], 'readonly');
          const objectStore = transaction.objectStore(objectStoreName);
          const index = objectStore.index('productId');
          return index.getAll();
        };
        this._count = (objectStoreName: string): IDBRequest<number> => {
          const transaction = this._dbObject!.transaction([this._objectStoreName], 'readonly');
          const objectStore = transaction.objectStore(objectStoreName);
          return objectStore.count();
        };
      };
    }
  }

  /**
   * Add a row to object store.
   * @static
   * @param {OBJECT_STORE_NAME} objectStoreName - An object store name.
   * @param {*} payload - The data.
   * @returns {Promise<IDBRequest<IDBValidKey> | undefined>} The promise hold result.
   */
  static add(objectStoreName: OBJECT_STORE_NAME, payload: any): Promise<IDBRequest<IDBValidKey> | undefined> {
    return new Promise((resolve, reject) => {
      if (this._itSelf._add) {
        const request = this._itSelf._add(objectStoreName, payload);
        handleRequestAsPromise(request, resolve, reject);
      } else {
        setTimeout(() => {
          const request = this._itSelf._add!(objectStoreName, payload);
          handleRequestAsPromise(request, resolve, reject);
        }, DELAY);
      }
    });
  }

  /**
   * Update a row in object store.
   * @static
   * @param {OBJECT_STORE_NAME} objectStoreName - An object store name.
   * @param {*} payload - The data.
   * @returns {Promise<IDBRequest<IDBValidKey> | undefined>} The promise hold result.
   */
  static update(
    objectStoreName: OBJECT_STORE_NAME,
    payload: any,
  ): Promise<IDBRequest<IDBValidKey> | undefined> {
    return new Promise((resolve, reject) => {
      if (this._itSelf._update) {
        const request = this._itSelf._update(objectStoreName, payload);
        handleRequestAsPromise(request, resolve, reject);
      } else {
        setTimeout(() => {
          const request = this._itSelf._update!(objectStoreName, payload);
          handleRequestAsPromise(request, resolve, reject);
        }, DELAY);
      }
    });
  }

  /**
   * Delete a row in object store.
   * @static
   * @param {OBJECT_STORE_NAME} objectStoreName - An object store name.
   * @param {string} key - The primary key.
   * @returns {Promise<IDBRequest<IDBValidKey> | undefined>} The promise hold result.
   */
  static delete(objectStoreName: OBJECT_STORE_NAME, key: string): Promise<IDBRequest<undefined> | undefined> {
    return new Promise((resolve, reject) => {
      if (this._itSelf._delete) {
        const request = this._itSelf._delete(objectStoreName, key);
        handleRequestAsPromise(request, resolve, reject);
      } else {
        setTimeout(() => {
          const request = this._itSelf._delete!(objectStoreName, key);
          handleRequestAsPromise(request, resolve, reject);
        }, DELAY);
      }
    });
  }

  /**
   * Get a row in object store.
   * @static
   * @param {OBJECT_STORE_NAME} objectStoreName - An object store name.
   * @param {string} key - The primary key.
   * @returns {Promise<IDBRequest<IDBValidKey> | undefined>} The promise hold result.
   */
  static get(objectStoreName: OBJECT_STORE_NAME, key: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this._itSelf._get) {
        const request = this._itSelf._get(objectStoreName, key);
        handleRequestAsPromise(request, resolve, reject);
      } else {
        setTimeout(() => {
          const request = this._itSelf._get!(objectStoreName, key);
          handleRequestAsPromise(request, resolve, reject);
        }, DELAY);
      }
    });
  }

  /**
   * Get all the primary keys in object store.
   * @static
   * @param {OBJECT_STORE_NAME} objectStoreName - An object store name.
   * @returns {Promise<IDBRequest<IDBValidKey[]>>} The promise hold result.
   */
  static getAllKeys(objectStoreName: OBJECT_STORE_NAME): Promise<IDBRequest<IDBValidKey[]>> {
    return new Promise((resolve, reject) => {
      if (this._itSelf._getAllKeys) {
        const request = this._itSelf._getAllKeys!(objectStoreName);
        handleRequestAsPromise(request, resolve, reject);
      } else {
        setTimeout(() => {
          const request = this._itSelf._getAllKeys!(objectStoreName);
          handleRequestAsPromise(request, resolve, reject);
        }, DELAY);
      }
    });
  }

  /**
   * Get all data rows in object store.
   * @static
   * @param {OBJECT_STORE_NAME} objectStoreName - An object store name.
   * @returns {Promise<IDBRequest<IDBValidKey[]>>} The promise hold result.
   */
  static getAll(objectStoreName: OBJECT_STORE_NAME): Promise<IDBRequest<IDBValidKey[]>> {
    return new Promise((resolve, reject) => {
      if (this._itSelf._getAll) {
        const request = this._itSelf._getAll!(objectStoreName);
        handleRequestAsPromise(request, resolve, reject);
      } else {
        setTimeout(() => {
          const request = this._itSelf._getAll!(objectStoreName);
          handleRequestAsPromise(request, resolve, reject);
        }, DELAY);
      }
    });
  }
}

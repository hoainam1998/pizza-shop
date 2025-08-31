import type { AxiosResponse } from 'axios';
import api from '@/axios';

type RequestBody = {
  [key: string]: any;
};

/**
 * Support call api from server.
 * @class
 */
class Services {
  private _baseUrl: string;

  /**
   * @constructor
   * @param {string} baseUrl - The base url.
   */
  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  /**
   * Axios post method.
   *
   * @param {string} subUrl - The sub url.
   * @param {RequestBody} body - The request body.
   * @returns {Promise<AxiosResponse>} - The promise response.
   */
  post(subUrl: string, body: RequestBody): Promise<AxiosResponse> {
    return api.post(`${this._baseUrl}/${subUrl}`, body);
  }
}

export const CategoryService = new Services('/category');

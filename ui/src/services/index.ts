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

  /**
   * Axios put method.
   *
   * @param {string} subUrl - The sub url.
   * @param {RequestBody} body - The request body.
   * @returns {Promise<AxiosResponse>} - The promise response.
   */
  put(subUrl: string, body: RequestBody): Promise<AxiosResponse> {
    return api.put(`${this._baseUrl}/${subUrl}`, body);
  }

  /**
   * Axios delete method.
   *
   * @param {string} subUrl - The sub url.
   * @returns {Promise<AxiosResponse>} - The promise response.
   */
  delete(subUrl: string): Promise<AxiosResponse> {
    return api.delete(`${this._baseUrl}/${subUrl}`);
  }
}

export const CategoryService = new Services('/category');

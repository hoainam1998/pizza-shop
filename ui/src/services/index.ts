import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from '@/axios';
import { HandleNotFoundError } from '@/decorators';
import type { ExtraConfigs } from '../interfaces';
import HandleUnknownAxiosError from '@/decorators/handle-unknown-axios-error';

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
   * Axios get method.
   *
   * @param {string} subUrl - The sub url.
   * @param {AxiosRequestConfig} - The axios config.
   * @returns {Promise<AxiosResponse>} - The promise response.
   */
  @HandleNotFoundError
  @HandleUnknownAxiosError
  get(subUrl: string, config?: ExtraConfigs): Promise<AxiosResponse> {
    return api.get(`${this._baseUrl}/${subUrl}`, config);
  }

  /**
   * Axios post method.
   *
   * @param {string} subUrl - The sub url.
   * @param {RequestBody} body - The request body.
   * @param {AxiosRequestConfig} - The axios config.
   * @returns {Promise<AxiosResponse>} - The promise response.
   */
  @HandleNotFoundError
  @HandleUnknownAxiosError
  post(subUrl: string, body: RequestBody, config?: ExtraConfigs): Promise<AxiosResponse> {
    return api.post(`${this._baseUrl}/${subUrl}`, body, config);
  }

  /**
   * Axios put method.
   *
   * @param {string} subUrl - The sub url.
   * @param {RequestBody} body - The request body.
   * @param {AxiosRequestConfig} - The axios config.
   * @returns {Promise<AxiosResponse>} - The promise response.
   */
  @HandleUnknownAxiosError
  put(subUrl: string, body: RequestBody, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return api.put(`${this._baseUrl}/${subUrl}`, body, config);
  }

  /**
   * Axios delete method.
   *
   * @param {string} subUrl - The sub url.
   * @param {AxiosRequestConfig} - The axios config.
   * @returns {Promise<AxiosResponse>} - The promise response.
   */
  @HandleUnknownAxiosError
  delete(subUrl: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return api.delete(`${this._baseUrl}/${subUrl}`, config);
  }
}

export const CategoryService = new Services('/category');
export const UserService = new Services('/user');
export const IngredientService = new Services('/ingredient');
export const UnitService = new Services('/unit');
export const ProductService = new Services('/product');

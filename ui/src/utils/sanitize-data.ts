import sanitize from 'sanitize-html';
import type { AxiosRequestConfig } from 'axios';

const allowedKeys = ['oldPassword', 'password'];

const options: sanitize.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

/**
 * Sanitize input data.
 *
 * @param {string} data - The input data.
 * @returns {string} - The sanitized data.
 */
const sanitizeData = (data: string): string => sanitize(data, options);

/**
 * Sanitizing value but exclude the keys.
 *
 * @param {string} key - The key name.
 * @param {string} value - The key value.
 * @returns {string} - Sanitized value. 
 */
const sanitizing = (key: string, value: string): string => {
  if (typeof value === 'string') {
    if (allowedKeys.includes(key)) {
      return value;
    }
    return sanitizeData(value);
  }
  return value;
};

/**
 * Sanitize data object.
 *
 * @param {object} obj - The input object.
 * @returns {object} - The sanitized object.
 */
const sanitizeDataObject = (obj: object): object => {
  return Object.entries(obj).reduce((data, [key, value]) => {
    Object.assign(data, { [key]: sanitizing(key, value) });
    return data;
  }, {});
};

/**
 * Sanitizing request data.
 */
export default (config: AxiosRequestConfig): void => {
  if (config.data) {
    if (config.data instanceof FormData) {
      const formData = new FormData();
      for (const [key, value] of config.data.entries()) {
        if (formData.has(key)) {
          formData.append(key, typeof value === 'string' ? sanitizeData(value) : value);
        } else {
          formData.set(key, typeof value === 'string' ? sanitizeData(value) : value);
        }
      }

      config.data = formData;
    } else {
      const body = JSON.parse(JSON.stringify(config.data));
      config.data = sanitizeDataObject(body);
    }
  }

  if (config.params) {
    const params = JSON.parse(JSON.stringify(config.params));
    config.params = sanitizeDataObject(params);
  }
};

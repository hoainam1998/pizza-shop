import sanitize from 'sanitize-html';
import type { AxiosRequestConfig } from 'axios';

const options: sanitize.IOptions = {
  allowedTags: [], // Disallow all HTML tags
  allowedAttributes: {}, // Disallow all attributes
};

/**
 * Sanitize input data.
 *
 * @param {string} data - The input data.
 * @returns {string} - The sanitized data.
 */
const sanitizeData = (data: string): string => sanitize(data, options);

/**
 * Sanitize data object.
 *
 * @param {object} obj - The input object.
 * @returns {object} - The sanitized object.
 */
const sanitizeDataObject = (obj: object): object => {
  return Object.entries(obj).reduce((data, [key, value]) => {
    Object.assign(data, { [key]: typeof value === 'string' ? sanitizeData(value) : value });
    return data;
  }, {});
};

/**
 * Sanitizing request data.
 */
export default (config: AxiosRequestConfig): void => {
  if (config.data) {
    if (config.data instanceof FormData) {
      for (const [key, value] of config.data.entries()) {
        if (typeof value === 'string') {
          config.data.set(key, sanitizeData(value));
        }
      }
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

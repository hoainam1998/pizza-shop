import {
  showErrorNotification,
  showSuccessNotification,
  showInfoNotification,
  confirmDeleteMessageBox,
} from './show-notification';
import { generateResetPasswordLink } from './auth';
import { formatDateHyphen, formatDateSlash } from './format-date';
import setTimeout from './set-timeout';
import sanitizeUserInput from './sanitize-data';

/**
 * Return promise of file from base64 string.
 *
 * @param {string} imageBase64String - base64 string present image.
 * @param {string} name - file name.
 * @returns {Promise<File>} - promise file.
 */
const convertBase64ToSingleFile = (imageBase64String: string, name: string): Promise<File> => {
  return fetch(imageBase64String)
    .then((res) => res.blob())
    .then((blob) => {
      return new File([blob], name, { type: blob.type });
    });
};

/**
 * Format vnd currency.
 *
 * @param {number|string} value - The currency value.
 * @returns {string} - The currency formatted string.
 */
const formatVNDCurrency = (value: number | string) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(+value);

/**
 * Replace thousand by k
 *
 * @param {number|string} value - The input value.
 * @returns {string} - The value after replace.
 */
const replaceThousand = (value: number | string) => value.toString().replace(/0{3}$/, 'k');

export {
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
  convertBase64ToSingleFile,
  formatDateHyphen,
  formatDateSlash,
  formatVNDCurrency,
  confirmDeleteMessageBox,
  generateResetPasswordLink,
  replaceThousand,
  sanitizeUserInput,
  setTimeout,
};

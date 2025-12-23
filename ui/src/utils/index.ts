import {
  showErrorNotification,
  showSuccessNotification,
  showInfoNotification,
  confirmDeleteMessageBox,
} from './show-notification';
import {
  generateResetPasswordLink
} from './auth';
import setTimeout from './set-timeout';

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
 * Format timestamp to format string.
 *
 * @param {string|number} timestamp - The timestamp.
 * @param {[string]} pattern - The date format pattern.
 * @returns {string} - The format date string.
 */
const formatDate = (timestamp: string | number, pattern?: string): string => {
  const date = new Date(+timestamp);
  const year = date.getFullYear();
  const months = date.getMonth() + 1;
  const day = date.getDate();

  switch (pattern) {
    case 'dd-MM-yyyy':
      return `${day}-${months}-${year}`;
    default:
      return `${day}/${months}/${year}`;
  }
};

/**
 * Format timestamp to format string with hyphen mark.
 *
 * @param {string|number} timestamp - The timestamp.
 * @returns {string} - The format date string.
 */
const formatDateHyphen = (timestamp: string | number) => formatDate(timestamp, 'dd-MM-yyyy');

/**
 * Format timestamp to format string with slash mark.
 *
 * @param {string|number} timestamp - The timestamp.
 * @returns {string} - The format date string.
 */
const formatDateSlash = formatDate;

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
  setTimeout,
};

import { showErrorNotification, showSuccessNotification } from './show-notification';

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

export {
  showSuccessNotification,
  showErrorNotification,
  convertBase64ToSingleFile,
};

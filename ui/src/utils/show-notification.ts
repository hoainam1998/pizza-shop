import { AxiosError, type AxiosResponse } from 'axios';
import { ElMessageBox, ElNotification, type NotificationParams } from 'element-plus';
import type { MessageResponseType } from '@/interfaces';

/**
* Show notification.
*
* @param {NotificationParams} options - The notification options.
*/
const showNotification = (params: NotificationParams | any): void => {
  if (params.message && params.title) {
    params.messages = [params.message].flat().reduce((messages, message) => {
      messages += `${message}\n`;
      return messages;
    });
    ElNotification(params);
  }
};

/**
* Show success notification.
*
* @param {string} title - The title.
* @param {string} message - The message.
* @param {object} options - The another options.
*/
const showSuccessNotification = (title: string, message?: string, options?: any): void => {
  showNotification({
    title,
    type: 'success',
    message,
    position: 'bottom-right',
    ...options,
  });
};

/**
* Show error notification.
*
* @param {string} title - The title.
* @param {string} message - The message.
* @param {object} options - The another options.
*/
const showErrorNotification = (title: string, message?: string, options?: any): void => {
  showNotification({
    title,
    type: 'error',
    message,
    position: 'bottom-right',
    ...options,
  });
};

/**
* Show info notification.
*
* @param {string} title - The title.
* @param {string} message - The message.
* @param {object} options - The another options.
*/
const showInfoNotification = (title: string, message?: string, options?: any): void => {
  showNotification({
    title,
    type: 'info',
    message,
    position: 'bottom-right',
    ...options,
  });
};

/**
 * The request callback.
 *
 * @callback actionCallback
 * @returns {Promise<AxiosResponse>} - The axios response.
 */

/**
 * Helper show dialog.
 *
 * @callback showDialog
 * @param {actionCallback} - The action callback.
 */

/**
 * Show dialog confirm delete item.
 *
 * @param {string} title - The dialog title.
 * @param {string} message - The main message.
 * @param {string} rejectMessage - The reject message.
 * @return {showDialog} - Show dialog helper.
 */
const confirmDeleteMessageBox = (
  title: string,
  message: string,
  rejectMessage: string) =>
  (action: () => Promise<AxiosResponse>) => {
    ElMessageBox.confirm(
      message,
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    )
      .then(() => {
        action()
          .then((response) => showSuccessNotification(title, response.data.message))
          .catch((error: AxiosError<MessageResponseType>) =>
            showErrorNotification(title, error.response?.data.message),
          );
      })
      .catch(() => showInfoNotification(title, rejectMessage));
};

export {
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
  confirmDeleteMessageBox,
};

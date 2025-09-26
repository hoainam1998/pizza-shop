import { ElNotification, type NotificationParams } from 'element-plus';

/**
* Show notification.
*
* @param {NotificationParams} options - The notification options.
*/
const showNotification = (params: NotificationParams | any): void => {
  if (params.message && params.title) {
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

export {
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
};

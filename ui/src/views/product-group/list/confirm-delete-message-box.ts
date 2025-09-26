import { AxiosError, type AxiosResponse } from 'axios';
import { ElMessageBox } from 'element-plus';
import { showSuccessNotification, showErrorNotification, showInfoNotification } from '@/utils';
import type { MessageResponseType } from '@/interfaces';
const title: string = 'Delete product!';

/**
 * The request callback.
 * @callback actionCallback
 * @returns {Promise<AxiosResponse>} - The axios response.
 */

/**
 * Show dialog confirm delete product.
 * @param {actionCallback} action - The request.
 */
export default (action: () => Promise<AxiosResponse>) => {
  ElMessageBox.confirm(
    'This product and all information about it will be delete! Are you sure to be continue?',
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
    .catch(() => showInfoNotification(title, 'Delete product request was cancel!'));
};

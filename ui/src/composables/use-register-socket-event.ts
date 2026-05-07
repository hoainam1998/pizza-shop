import SocketService from '@/socket';
import { ElMessageBox } from 'element-plus';
import { SOCKET_EVENT_NAME } from '@/enums';
import { forceLogout } from '@/utils';

const showForceLogoutNotification = (message: string): void => {
  ElMessageBox.confirm(message, 'Warning', {
    confirmButtonText: 'OK',
    type: 'warning',
    showCancelButton: false,
  });
};

export default (): void => {
  const shouldLogout = (reason: string): void => {
    forceLogout();
    showForceLogoutNotification(reason);
  };

  SocketService.subscribe(SOCKET_EVENT_NAME.UPDATE_USER_INFO, () => {
    shouldLogout('Your information have been updated. You will force logout!');
  });
  SocketService.subscribe(SOCKET_EVENT_NAME.UPDATE_USER_POWER, () => {
    shouldLogout('Your role have been updated. You will force logout!');
  });
  SocketService.subscribe(SOCKET_EVENT_NAME.UPDATE_USER_STATUS, () => {
    shouldLogout('You have been blocked. You will force logout!');
  });
};

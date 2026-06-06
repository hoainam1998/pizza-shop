import SocketService from '@/socket';
import { ElMessageBox } from 'element-plus';
import { SOCKET_EVENT_NAME } from '@/enums';
import useLogout from '@/composables/use-logout';

const showForceLogoutNotification = (message: string): void => {
  ElMessageBox.confirm(message, 'Warning', {
    confirmButtonText: 'OK',
    type: 'warning',
    showCancelButton: false,
  });
};

export default (): void => {
  const logout = useLogout();
  const shouldLogout = (reason: string): void => {
    logout();
    showForceLogoutNotification(reason);
  };

  SocketService.subscribe(SOCKET_EVENT_NAME.UPDATE_USER_INFO, () => {
    shouldLogout('Your information have been updated. You will force logout!');
  });
};

import { UserService } from '@/services';
import { showErrorNotification, forceLogout } from '@/utils';

export default (): (() => void) => {
  return () => {
    UserService.get('logout')
      .catch((error) => {
        showErrorNotification('Logout!', error.response.data.messages);
      })
      .finally(forceLogout);
  };
};
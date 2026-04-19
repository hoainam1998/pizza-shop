import { UserService } from '@/services';
import { showErrorNotification } from '@/utils';
import useWrapperRouter from '@/composables/use-router';
import paths from '@/router/paths';
import Storage from '@/storage/storage';

export default (): () => void => {
  const { push } = useWrapperRouter();

  return () => {
    UserService.get('logout')
      .catch((error) => {
        showErrorNotification('Logout', error.response.data.messages);
      })
      .finally(() => {
        push(paths.LOGIN);
        Storage.clear();
      });
  };
};
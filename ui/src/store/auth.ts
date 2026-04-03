import { AlreadyLoginStorage } from '@/storage/local-storage';

export default {
  setAlreadyLogin(value: boolean): void {
    AlreadyLoginStorage.setItem(value);
  },
  getAlreadyLogin(): boolean | undefined {
    return AlreadyLoginStorage.getItem();
  }
};

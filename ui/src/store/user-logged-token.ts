import { UserLoggedTokenStorage } from '@/storage/local-storage';
import { setUser } from './user';

export default {
  setUserLoggedToken(value: string): void {
    UserLoggedTokenStorage.setItem(value);
    setUser(value);
  },
  getUserLoggedToken(): string | undefined {
    return UserLoggedTokenStorage.getItem();
  }
};

import { reactive } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { UserLoggedTokenStorage, ApiKeyStorage } from '@/storage/local-storage';
import { POWER, SEX } from '@/enums';
import { type UserDetailModelType } from '@/interfaces';

type UserLoggedType = Omit<UserDetailModelType, 'avatar'> & {
  avatar: string;
};

const defaultUser = {
  userId: '',
  firstName: '',
  lastName: '',
  avatar: '',
  phone: '',
  email: '',
  sex: SEX.MALE,
  power: POWER.SALE,
};

const userLogged = reactive<UserLoggedType>(defaultUser);
const oldLoggedToken = UserLoggedTokenStorage.getItem();

if (oldLoggedToken) {
  Object.assign(userLogged, jwtDecode(oldLoggedToken));
}

export default {
  getAlreadyLogin(): boolean | undefined {
    return !!ApiKeyStorage.getItem();
  },
  getUserPower(): POWER | undefined {
    return userLogged.power!;
  },
  setUserLoggedToken(value: string): void {
    UserLoggedTokenStorage.setItem(value);
    this.setUser();
  },
  getUserLoggedToken(): string | undefined {
    return UserLoggedTokenStorage.getItem();
  },
  setApiKey(value: string): void {
    ApiKeyStorage.setItem(value);
  },
  getApiKey(): string | undefined {
    return ApiKeyStorage.getItem();
  },
  setUser(): void {
    const token = this.getUserLoggedToken();
    if (token) {
      Object.assign(userLogged, jwtDecode(token));
    }
  },
  getUser(): UserLoggedType {
    return userLogged;
  },
};


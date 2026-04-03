import { POWER, SEX } from '@/enums';
import { jwtDecode } from 'jwt-decode';
import userLoggedToken from './user-logged-token';
import { type UserDetailModelType } from '@/interfaces';
import { reactive } from 'vue';

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

const token = userLoggedToken.getUserLoggedToken();

const setUser = (token?: string): void => {
  if (token) {
    Object.assign(userLogged, jwtDecode(token));
  }
};

setUser(token);

export { setUser };

export default userLogged;

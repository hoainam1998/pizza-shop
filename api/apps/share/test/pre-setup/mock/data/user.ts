import { SessionData } from 'express-session';
import constants from '@share/constants';
import { UserRequestType } from '@share/interfaces';
import { autoGeneratePassword, signingAdminResetPasswordToken } from '@share/utils';
const plainPassword = autoGeneratePassword();

export const user: Required<UserRequestType> = {
  user_id: Date.now().toString(),
  first_name: 'first name',
  last_name: 'last name',
  email: 'myemail@gmail.com',
  phone: '0987654321',
  avatar: 'avatar',
  password: '$2b$10$Cfc',
  sex: constants.SEX.FEMALE,
  power: constants.POWER_NUMERIC.SUPER_ADMIN,
  plain_password: plainPassword,
  session_id: null,
  reset_password_token: signingAdminResetPasswordToken({ email: 'myemail@gmail.com', password: plainPassword }),
};

export const sessionPayload: SessionData['user'] = {
  email: user.email,
  power: user.power,
  userId: user.user_id,
  canSignup: false,
};

export const createUsers = (length: number): Partial<typeof user>[] => {
  return Array.apply(this, Array(length)).map(() => ({
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    sex: user.sex,
    power: user.power,
  }));
};

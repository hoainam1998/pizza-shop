import { SessionData } from 'express-session';
import { UserRequestType } from '@share/interfaces';
import { autoGeneratePassword, signingAdminResetPasswordToken, signAdminApiKey } from '@share/utils';
import { POWER_NUMERIC, SEX } from '@share/enums';
import { user as userPrisma } from 'generated/prisma';
const plainPassword = autoGeneratePassword();

export const user: Required<UserRequestType> = {
  user_id: Date.now().toString(),
  first_name: 'first name',
  last_name: 'last name',
  email: 'myemail@gmail.com',
  phone: '0987654321',
  avatar: 'avatar',
  password: '$2b$10$Cfc',
  sex: SEX.FEMALE,
  power: POWER_NUMERIC.SUPER_ADMIN,
  plain_password: plainPassword,
  session_id: null,
  reset_password_token: expect.any(String),
  reset_password_link: expect.any(String),
};

export const sessionPayload: SessionData['user'] = {
  email: user.email,
  power: user.power,
  userId: user.user_id,
  canSignup: false,
};

export const resetPasswordToken = signingAdminResetPasswordToken({
  email: 'myemail@gmail.com',
  password: plainPassword,
});

export const createUsers = (length: number): Partial<userPrisma>[] => {
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

export const apiKey = signAdminApiKey({ userId: user.user_id, email: user.email, power: user.power });

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
  reset_password_token: signingAdminResetPasswordToken({ email: 'myemail@gmail.com', password: plainPassword }),
};

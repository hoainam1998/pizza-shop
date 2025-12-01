import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsInt, IsPhoneNumber, IsString, IsStrongPassword, Matches } from 'class-validator';
import constants from '@share/constants';
import { UserRequestType } from '@share/interfaces';

export class SignupDTO {
  @Exclude({ toPlainOnly: true })
  @IsString()
  firstName: string;

  @Exclude({ toPlainOnly: true })
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('VN')
  phone: string;

  @IsInt()
  sex: number;

  @Expose({ toPlainOnly: true })
  get power() {
    return constants.POWER_NUMERIC.SUPER_ADMIN;
  }

  @Expose({ toPlainOnly: true })
  get first_name() {
    return this.firstName;
  }

  @Expose({ toPlainOnly: true })
  get last_name() {
    return this.lastName;
  }

  constructor(target: UserRequestType) {
    Object.assign(this, target);
  }
}

export class LoginInfo {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 8, minSymbols: 1 })
  @Matches(new RegExp(constants.PASSWORD_PATTERN))
  password: string;
}

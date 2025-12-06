import { IsBoolean, IsInt, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import Validator from './validator';
import { UserRequestType } from '@share/interfaces';

export class CanSignupSerializer extends Validator {
  @IsBoolean()
  canSignup: boolean;

  constructor(value: number) {
    super();
    this.canSignup = value === 0;
  }
}

export class LoginSerializer extends Validator {
  @Exclude({ toPlainOnly: true })
  @IsString()
  user_id: string;

  @Exclude({ toPlainOnly: true })
  @IsString()
  first_name: string;

  @Exclude({ toPlainOnly: true })
  @IsString()
  last_name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone: string;

  @IsInt()
  sex: number;

  @IsInt()
  power: number;

  @Exclude({ toPlainOnly: true })
  @IsOptional()
  @IsString()
  reset_password_token: string;

  @Expose({ toPlainOnly: true })
  get userId() {
    return this.user_id;
  }

  @Expose({ toPlainOnly: true })
  get firstName() {
    return this.first_name;
  }

  @Expose({ toPlainOnly: true })
  get lastName() {
    return this.last_name;
  }

  @IsOptional()
  @Expose({ toPlainOnly: true })
  get resetPasswordToken() {
    return this.reset_password_token;
  }

  @Expose({ toPlainOnly: true })
  get isFirstTime() {
    return !!this.reset_password_token;
  }

  constructor(target: UserRequestType) {
    super();
    Object.assign(this, target);
  }
}

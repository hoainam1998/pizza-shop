import { Exclude, Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
  IsIn,
  IsOptional,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import constants from '@share/constants';
import { UserRequestType } from '@share/interfaces';
import Validator from '../serializer/validator';
import { Pagination } from './common.dto';
const power = Object.values(constants.POWER_NUMERIC);

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

export class CreateUser extends OmitType(SignupDTO, ['power']) {
  @IsInt()
  @IsIn(power)
  power: number;

  @Expose({ toPlainOnly: true })
  get first_name() {
    return this.firstName;
  }

  @Expose({ toPlainOnly: true })
  get last_name() {
    return this.lastName;
  }
}

export class LoginInfo {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 8, minUppercase: 0, minNumbers: 0, minSymbols: 1 })
  @Matches(new RegExp(constants.PASSWORD_PATTERN))
  password: string;
}

export class ResetPassword {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 8, minUppercase: 0, minNumbers: 0, minSymbols: 0 })
  @Matches(new RegExp(constants.PASSWORD_PATTERN))
  password: string;

  @IsStrongPassword({ minLength: 8, minUppercase: 0, minNumbers: 0, minSymbols: 0 })
  @Matches(new RegExp(constants.PASSWORD_PATTERN))
  oldPassword: string;

  @IsString()
  token: string;
}

export class LoginSessionPayload extends Validator {
  @IsEmail()
  email: string;

  @IsBoolean()
  canSignup: boolean;

  @IsString()
  userId: string;

  @IsInt()
  power: number;

  constructor(target: LoginSessionPayload) {
    super();
    Object.assign(this, target);
  }
}

export class UserQuery {
  @IsOptional()
  @IsBoolean()
  avatar: boolean;

  @IsOptional()
  @IsBoolean()
  firstName: boolean;

  @IsOptional()
  @IsBoolean()
  lastName: boolean;

  @IsOptional()
  @IsBoolean()
  email: boolean;

  @IsOptional()
  @IsBoolean()
  phone: boolean;

  @IsOptional()
  @IsBoolean()
  sex: boolean;

  @IsOptional()
  @IsBoolean()
  power: boolean;

  @Expose({ toPlainOnly: true })
  get last_name() {
    return this.lastName;
  }

  @Expose({ toPlainOnly: true })
  get first_name() {
    return this.firstName;
  }

  @Expose({ toPlainOnly: true })
  get user_id() {
    return true;
  }

  static plain(target: UserPagination['query']): Record<string, any> {
    if (Array.from(Object.values(target)).every((value) => value == undefined)) {
      target.avatar = true;
      target.firstName = true;
      target.lastName = true;
      target.email = true;
      target.phone = true;
      target.sex = true;
      target.power = true;
    }
    const query = instanceToPlain(plainToInstance(UserQuery, target));
    return instanceToPlain(plainToInstance(UserQueryTransform, query), {
      exposeUnsetFields: false,
    });
  }
}

export class UserQueryTransform extends OmitType(UserQuery, ['firstName', 'lastName']) {
  @Exclude()
  firstName: boolean;

  @Exclude()
  lastName: boolean;
}

export class UserPagination extends Pagination {
  @IsOptional()
  @IsString()
  search: string;

  @IsDefined()
  @Type(() => UserQuery)
  @ValidateNested({ each: true })
  query: UserQuery;
}

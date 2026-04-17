import { Exclude, Expose, instanceToPlain, plainToInstance, Transform, Type } from 'class-transformer';
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
  IsNumberString,
  Length,
  Allow,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import constants from '@share/constants';
import { UserRequestType } from '@share/interfaces';
import Validator from '@share/dto/serializer/validator';
import { Pagination } from '@share/dto/validators/common.dto';
import { APP_NAME, POWER_NUMERIC } from '@share/enums';
const power: POWER_NUMERIC[] = [POWER_NUMERIC.ADMIN, POWER_NUMERIC.SALE];

export class UserDTO {
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

  @Transform(({ value }) => +value)
  @IsInt()
  sex: number;

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

export class SignupDTO extends UserDTO {
  @Expose({ toPlainOnly: true })
  get power() {
    return POWER_NUMERIC.SUPER_ADMIN;
  }

  constructor(target: UserRequestType) {
    super(target);
    Object.assign(this, target);
  }
}

export class CreateUser extends UserDTO {
  @IsInt()
  @IsIn(power)
  power: number;

  static plain(user: CreateUser): Record<string, any> {
    return instanceToPlain(plainToInstance(CreateUser, user));
  }
}

export class UpdateUser extends CreateUser {
  @IsNumberString()
  @Length(13)
  userId: string;

  @Expose({ toPlainOnly: true })
  get user_id() {
    return this.userId;
  }

  @Expose({ toPlainOnly: true })
  get session_id() {
    return null;
  }

  static plain(target: Record<string, any>): Record<string, any> {
    const updateUserPlain = instanceToPlain(plainToInstance(UpdateUser, target));
    return instanceToPlain(plainToInstance(UpdateUserTransform, updateUserPlain));
  }
}

export class UpdateUserTransform extends OmitType(UpdateUser, ['userId']) {
  @Exclude()
  userId: string;
}

export class LoginInfo {
  @IsEmail()
  email: string;

  @IsStrongPassword({ minLength: 8, minUppercase: 0, minNumbers: 0, minSymbols: 1 })
  @Matches(new RegExp(constants.PASSWORD_PATTERN))
  password: string;

  @Allow()
  session_id: string;

  @Allow()
  by?: APP_NAME;
}

export class UpdatePersonalInfo extends UserDTO {
  @Allow()
  userId: string;

  @Allow()
  avatar: string;

  @Expose({ toPlainOnly: true })
  get user_id() {
    return this.userId;
  }

  static plain(target: UpdatePersonalInfo): Record<string, any> {
    const updatePersonalInfoPlain = instanceToPlain(plainToInstance(UpdatePersonalInfo, target));
    return instanceToPlain(plainToInstance(UpdatePersonalInfoTransform, updatePersonalInfoPlain));
  }
}

export class UpdatePersonalInfoTransform extends OmitType(UpdatePersonalInfo, ['userId']) {
  @Exclude()
  userId: string;
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

  @Allow()
  by?: APP_NAME;
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

  static plain(target: Record<string, any>): Record<string, any> {
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

  @Allow()
  requesterId: string;

  @IsDefined()
  @Type(() => UserQuery)
  @ValidateNested({ each: true })
  query: UserQuery;
}

export class UserDetail {
  @IsDefined()
  @Type(() => UserQuery)
  @ValidateNested({ each: true })
  query: UserQuery;

  @IsDefined()
  @IsNumberString()
  @Length(13)
  userId: string;

  @Expose({ toPlainOnly: true })
  get user_id() {
    return this.userId;
  }

  static plain(target: Record<string, any>): Record<string, any> {
    const userDetailPlain = instanceToPlain(plainToInstance(UserDetail, target));
    const userDetailTransform = instanceToPlain(plainToInstance(UserDetailTransform, userDetailPlain));
    const query = UserQuery.plain(target.query as Record<string, any>);

    return {
      ...userDetailTransform,
      query,
    };
  }
}

export class UserDetailTransform extends OmitType(UserDetail, ['userId']) {
  @Exclude()
  userId: string;
}

export class UserDelete {
  @IsDefined()
  @IsNumberString()
  @Length(13)
  userId: string;
}

export class UpdatePower {
  @IsInt()
  @IsIn(power)
  power: number;

  @IsNumberString()
  @Length(13)
  userId: string;

  @Expose({ toPlainOnly: true })
  get user_id() {
    return this.userId;
  }

  static plain(target: UpdatePower): Record<string, any> {
    const updatePowerPlain = instanceToPlain(plainToInstance(UpdatePower, target));
    return instanceToPlain(plainToInstance(UpdatePowerTransform, updatePowerPlain));
  }
}

export class UpdatePowerTransform extends OmitType(UpdatePower, ['userId']) {
  @Exclude()
  userId: string;
}

import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import { user } from 'generated/prisma';
import Validator from './validator';
import { UserLoggedType, UserPaginationResponse, UserLoggedSerializerType } from '@share/interfaces';
import { signUserLoggedToken } from '@share/utils';
import { POWER_NUMERIC, STATUS, SEX } from '@share/enums';
import constants from '@share/constants';
const power: POWER_NUMERIC[] = [POWER_NUMERIC.SUPER_ADMIN, POWER_NUMERIC.ADMIN, POWER_NUMERIC.SALE];
const status: STATUS[] = [STATUS.UN_BLOCK, STATUS.BLOCK];
const sex: SEX[] = [SEX.MALE, SEX.FEMALE];

export class CanSignupSerializer extends Validator {
  @IsBoolean()
  canSignup: boolean;

  constructor(value: number) {
    super();
    this.canSignup = value === 0;
  }
}

export class UserSerializer extends Validator {
  @Exclude({ toPlainOnly: true })
  @Matches(constants.ID_PATTERN)
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

  @IsOptional()
  @IsInt()
  @IsIn(sex)
  sex: number;

  @IsOptional()
  @IsInt()
  @IsIn(power)
  power: number;

  @IsOptional()
  @IsInt()
  @IsIn(status)
  active: number;

  @Exclude({ toPlainOnly: true })
  @IsOptional()
  @IsString()
  api_key: string;

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
  get apiKey() {
    return this.api_key;
  }

  @IsOptional()
  @Expose({ toPlainOnly: true })
  get isFirstTime() {
    return !!this.reset_password_token;
  }

  @IsOptional()
  @Expose({ toPlainOnly: true })
  get resetPasswordToken() {
    return this.reset_password_token;
  }

  constructor(target: Partial<user>) {
    super();
    Object.assign(this, target);
  }

  static plain(target: Record<string, any>): Record<string, any> {
    return instanceToPlain(plainToInstance(this, target));
  }
}

export class LoginSerializer extends UserSerializer {
  static serializer(plain: Record<string, any>): UserLoggedSerializerType {
    return {
      isFirstTime: plain.isFirstTime,
      resetPasswordToken: plain.resetPasswordToken,
      userLoggedToken: plain.isFirstTime ? null : signUserLoggedToken(plain),
      apiKey: plain.isFirstTime ? null : plain.apiKey,
    };
  }

  constructor(target: UserLoggedType) {
    super(target);
    Object.assign(this, target);
  }
}

export class PaginationUserSerializer extends Validator {
  @IsDefined()
  @IsInt()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserSerializer)
  list: UserSerializer[];

  constructor(results: UserPaginationResponse) {
    super();
    if (results) {
      this.total = results.total;
      this.list = results.list.map((user) => plainToInstance(UserSerializer, user));
    }
  }
}

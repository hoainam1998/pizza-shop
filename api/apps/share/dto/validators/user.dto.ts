import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsInt, IsPhoneNumber, IsString } from 'class-validator';
import constants from '@share/constants';

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
  power = constants.POWER_NUMERIC.SUPER_ADMIN;

  @Expose()
  get first_name() {
    return this.firstName;
  }

  @Expose()
  get last_name() {
    return this.lastName;
  }
}

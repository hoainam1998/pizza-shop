import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsInt, IsPhoneNumber, IsString } from 'class-validator';

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

  @Expose()
  get first_name() {
    return this.firstName;
  }

  @Expose()
  get last_name() {
    return this.lastName;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { user } from 'generated/prisma';
import { USER_SERVICE } from '@share/di-token';
import { canSignupPattern, signupPattern, loginPattern, resetPasswordPattern } from '@share/pattern';
import { UserRequestType } from '@share/interfaces';
import { LoginInfo, ResetPassword } from '@share/dto/validators/user.dto';

@Injectable()
export default class UserService {
  constructor(@Inject(USER_SERVICE) private readonly user: ClientProxy) {}

  canSignup(): Observable<number> {
    return this.user.send<number>(canSignupPattern, {});
  }

  signup(user: user): Observable<user> {
    return this.user.send<user>(signupPattern, user);
  }

  login(loginInfo: LoginInfo): Observable<UserRequestType> {
    return this.user.send<UserRequestType>(loginPattern, loginInfo);
  }

  resetPassword(resetPasswordBody: ResetPassword): Observable<Omit<user, 'password' | 'phone'>> {
    return this.user.send<user>(resetPasswordPattern, resetPasswordBody);
  }
}

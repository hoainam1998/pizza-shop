import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { user } from 'generated/prisma';
import { USER_SERVICE } from '@share/di-token';
import {
  canSignupPattern,
  signupPattern,
  loginPattern,
  resetPasswordPattern,
  paginationPattern,
  getUserDetailPattern,
  updateUserPattern,
  deleteUserPattern,
} from '@share/pattern';
import type { UserPaginationResponse, UserWithOnlySessionIDType } from '@share/interfaces';
import { LoginInfo, ResetPassword } from '@share/dto/validators/user.dto';

@Injectable()
export default class UserService {
  constructor(@Inject(USER_SERVICE) private readonly user: ClientProxy) {}

  canSignup(): Observable<number> {
    return this.user.send<number>(canSignupPattern, {});
  }

  signup(user: Record<string, any>): Observable<Pick<user, 'email' | 'reset_password_token'>> {
    return this.user.send<user>(signupPattern, user);
  }

  login(loginInfo: LoginInfo): Observable<user> {
    return this.user.send<user>(loginPattern, loginInfo);
  }

  resetPassword(resetPasswordBody: ResetPassword): Observable<Omit<user, 'password' | 'phone'>> {
    return this.user.send<user>(resetPasswordPattern, resetPasswordBody);
  }

  pagination(select: Record<string, any>): Observable<UserPaginationResponse> {
    return this.user.send<UserPaginationResponse>(paginationPattern, select);
  }

  getUserDetail(query: Record<string, any>): Observable<user> {
    return this.user.send<user>(getUserDetailPattern, query);
  }

  updateUser(user: Record<string, any>): Observable<UserWithOnlySessionIDType> {
    return this.user.send<UserWithOnlySessionIDType>(updateUserPattern, user);
  }

  deleteUser(userId: string): Observable<UserWithOnlySessionIDType> {
    return this.user.send<UserWithOnlySessionIDType>(deleteUserPattern, userId);
  }
}

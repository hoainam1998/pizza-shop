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
  logoutPattern,
  updatePersonalInfoPattern,
} from '@share/pattern';
import type {
  UserCreatedReturnType,
  UserLoggedType,
  UserPaginationResponse,
  UserWithOnlySessionIDType,
} from '@share/interfaces';
import { LoginInfo, ResetPassword } from '@share/dto/validators/user.dto';

@Injectable()
export default class UserService {
  constructor(@Inject(USER_SERVICE) private readonly user: ClientProxy) {}

  canSignup(): Observable<number> {
    return this.user.send<number>(canSignupPattern, {});
  }

  signup(user: Record<string, any>): Observable<UserCreatedReturnType> {
    return this.user.send<UserCreatedReturnType>(signupPattern, user);
  }

  login(loginInfo: LoginInfo): Observable<UserLoggedType> {
    return this.user.send<UserLoggedType>(loginPattern, loginInfo);
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

  updatePersonalInfo(personalInfo: Record<string, any>): Observable<user> {
    return this.user.send<user>(updatePersonalInfoPattern, personalInfo);
  }

  deleteUser(userId: string): Observable<UserWithOnlySessionIDType> {
    return this.user.send<UserWithOnlySessionIDType>(deleteUserPattern, userId);
  }

  logout(userId: string): Observable<null> {
    return this.user.send<null>(logoutPattern, userId);
  }
}

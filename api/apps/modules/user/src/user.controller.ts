import { BadRequestException, Controller, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { type user } from 'generated/prisma';
import { MessagePattern } from '@nestjs/microservices';
import UsersService from './user.service';
import LoggingService from '@share/libs/logging/logging.service';
import { HandleServiceError, HandleJwtVerifyError } from '@share/decorators';
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
import type {
  UserDetailType,
  UserPaginationResponse,
  UserSignupType,
  UserWithOnlySessionIDType,
} from '@share/interfaces';
import { LoginInfo, ResetPassword, UserPagination } from '@share/dto/validators/user.dto';
import {
  checkArrayHaveValues,
  comparePassword,
  createMessage,
  omitFields,
  verifyAdminResetPasswordToken,
} from '@share/utils';
import messages from '@share/constants/messages';

@Controller('user')
export default class UserController {
  constructor(
    private readonly userService: UsersService,
    private readonly logger: LoggingService,
  ) {}

  @MessagePattern(canSignupPattern)
  @HandleServiceError
  canSignup(): Promise<number> {
    return this.userService.canSignup();
  }

  @MessagePattern(signupPattern)
  @HandleServiceError
  signup(user: UserSignupType): Promise<Pick<user, 'email' | 'reset_password_token'>> {
    return this.userService.signup(user);
  }

  @MessagePattern(loginPattern)
  @HandleServiceError
  login(loginInfo: LoginInfo): Promise<Omit<user, 'password' | 'phone'>> {
    return this.userService.login(loginInfo.email).then((user) => {
      if (comparePassword(loginInfo.password, user.password)) {
        return omitFields(['password'], user) as Omit<user, 'password'>;
      }
      throw new BadRequestException(createMessage(messages.USER.PASSWORD_NOT_MATCH));
    });
  }

  @MessagePattern(resetPasswordPattern)
  @HandleServiceError
  @HandleJwtVerifyError
  async resetPassword(resetPasswordBody: ResetPassword): Promise<Omit<user, 'password' | 'phone'>> {
    const payload = await verifyAdminResetPasswordToken(resetPasswordBody.token);
    if (payload) {
      const isSame = payload.email === resetPasswordBody.email && payload.password === resetPasswordBody.oldPassword;

      if (isSame) {
        return this.userService.getDetail(resetPasswordBody.email, { password: true }).then((user: user) => {
          if (comparePassword(resetPasswordBody.oldPassword, user.password)) {
            return this.userService.resetPassword(resetPasswordBody);
          } else {
            throw new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH));
          }
        });
      }
      throw new UnauthorizedException(createMessage(messages.USER.NOT_FOUND));
    } else {
      throw new UnauthorizedException(createMessage(messages.USER.NOT_FOUND));
    }
  }

  @MessagePattern(paginationPattern)
  @HandleServiceError
  pagination(select: UserPagination): Promise<UserPaginationResponse> {
    return this.userService.pagination(select).then((results) => {
      const [list, total] = results;
      if (!checkArrayHaveValues(list as Partial<user>[])) {
        throw new NotFoundException({
          list: [],
          total: 0,
        });
      }
      return {
        list,
        total,
      } as UserPaginationResponse;
    });
  }

  @MessagePattern(getUserDetailPattern)
  @HandleServiceError
  getUser(select: UserDetailType): Promise<user> {
    return this.userService.getUser(select);
  }

  @MessagePattern(updateUserPattern)
  @HandleServiceError
  update(user: user): Promise<UserWithOnlySessionIDType> {
    return this.userService.update(user);
  }

  @MessagePattern(deleteUserPattern)
  @HandleServiceError
  delete(userId: string): Promise<user> {
    return this.userService.delete(userId);
  }
}

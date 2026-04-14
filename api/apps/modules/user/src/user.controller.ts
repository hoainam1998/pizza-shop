import { Controller, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { type user } from 'generated/prisma';
import { MessagePattern } from '@nestjs/microservices';
import UsersService from './user.service';
import LoggingService from '@share/libs/logging/logging.service';
import { HandleServiceError, HandleJwtVerifyError } from '@share/decorators';
import {
  canSignupPattern,
  signupPattern,
  loginPattern,
  logoutPattern,
  resetPasswordPattern,
  paginationPattern,
  getUserDetailPattern,
  updateUserPattern,
  updatePowerPattern,
  updatePersonalInfoPattern,
  deleteUserPattern,
} from '@share/pattern';
import type {
  UserCreatedReturnType,
  UserDetailType,
  UserLoggedType,
  UserPaginationResponse,
  UserSignupType,
  UserWithOnlySessionIDType,
} from '@share/interfaces';
import { LoginInfo, ResetPassword, UpdatePower, UserPagination } from '@share/dto/validators/user.dto';
import {
  checkArrayHaveValues,
  comparePassword,
  createMessage,
  omitFields,
  verifyAdminResetPasswordToken,
} from '@share/utils';
import messages from '@share/constants/messages';
import { APP_NAME, POWER_NUMERIC } from '@share/enums';

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
  signup(user: UserSignupType): Promise<UserCreatedReturnType> {
    return this.userService.signup(user);
  }

  @MessagePattern(loginPattern)
  @HandleServiceError
  async login(loginInfo: LoginInfo): Promise<UserLoggedType> {
    if (!(await this.userService.checkUserLogged(loginInfo.session_id))) {
      return this.userService.login(loginInfo.email).then(async (user) => {
        if (loginInfo.by) {
          if (loginInfo.by === APP_NAME.ADMIN) {
            if (user.power === POWER_NUMERIC.SALE) {
              throw new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_SALE_LOGIN));
            }
          } else {
            if (user.power === POWER_NUMERIC.ADMIN) {
              throw new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_ADMIN_LOGIN));
            }
          }
        } else {
          throw new UnauthorizedException(createMessage(messages.COMMON.UNKNOWN_RESOURCE));
        }

        if (user.session_id) {
          throw new UnauthorizedException(createMessage(messages.USER.ALREADY_LOGIN));
        } else {
          if (comparePassword(loginInfo.password, user.password)) {
            if (!user.reset_password_token) {
              await this.userService.updateUserSessionId(user.user_id, loginInfo.session_id);
            }
            return omitFields(['password', 'session_id'], user) as UserLoggedType;
          }
          throw new UnauthorizedException(createMessage(messages.USER.PASSWORD_NOT_MATCH));
        }
      });
    }
    throw new UnauthorizedException(createMessage(messages.USER.ALREADY_LOGIN));
  }

  @MessagePattern(resetPasswordPattern)
  @HandleServiceError
  @HandleJwtVerifyError
  async resetPassword(resetPasswordBody: ResetPassword): Promise<Omit<user, 'password' | 'phone'>> {
    const payload = await verifyAdminResetPasswordToken(resetPasswordBody.token);
    if (payload) {
      const isSame = payload.email === resetPasswordBody.email && payload.password === resetPasswordBody.oldPassword;

      if (isSame) {
        return this.userService.getDetail(resetPasswordBody.email, { password: true }).then((user: unknown) => {
          if (comparePassword(resetPasswordBody.oldPassword, (user as user).password)) {
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
    return this.userService.update(user).then(async (userResult) => {
      await this.userService.logout(user.user_id);
      return userResult;
    });
  }

  @MessagePattern(deleteUserPattern)
  @HandleServiceError
  async delete(userId: string): Promise<UserWithOnlySessionIDType> {
    await this.userService.logout(userId);
    return this.userService.delete(userId);
  }

  @MessagePattern(updatePowerPattern)
  @HandleServiceError
  updatePower(payload: UpdatePower): Promise<user> {
    return this.userService.updatePower(payload).then(async (user) => {
      await this.userService.logout(user.user_id);
      return user;
    });
  }

  @MessagePattern(logoutPattern)
  @HandleServiceError
  logout(userId: string): Promise<null> {
    return this.userService.logout(userId);
  }

  @MessagePattern(updatePersonalInfoPattern)
  @HandleServiceError
  updatePersonalInfo(user: user): Promise<user> {
    return this.userService.updatePersonalInfo(user).then(async (userResult) => {
      await this.userService.logout(user.user_id);
      return userResult;
    });
  }
}

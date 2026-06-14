import { BadRequestException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient, type user, type Prisma } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import messages from '@share/constants/messages';
import { HandlePrismaError } from '@share/decorators';
import type {
  RefreshResetPasswordTokenResponse,
  UserCreatedReturnType,
  UserPaginationPrismaResponse,
  UserSignupType,
  UserWithOnlySessionIDType,
} from '@share/interfaces';
import {
  calcSkip,
  createMessage,
  autoGeneratePassword,
  signingAdminResetPasswordToken,
  getResetPasswordLink,
} from '@share/utils';
import {
  ResetPassword,
  UserPagination,
  LoginSessionPayload,
  UpdatePower,
  UpdateStatus,
  RefreshResetResetPasswordToken,
} from '@share/dto/validators/user.dto';
import UserCachingService from '@share/libs/caching/user/user.service';
import ProductCachingService from '@share/libs/caching/product/product.service';
import ReportCachingService from '@share/libs/caching/report/report.service';
import Event from '@share/libs/redis-client/events/event';
import { APP_NAME, POWER_NUMERIC, STATUS } from '@share/enums';

type RequesterFromType = {
  by?: APP_NAME;
};

@Injectable()
export default class UserService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient,
    private readonly userCachingService: UserCachingService,
    private readonly productCachingService: ProductCachingService,
    private readonly reportCachingService: ReportCachingService,
  ) {
    userCachingService.logoutSubscribeWithSessionExpired((redisSessionId: string) => {
      if (/ps:\w+/.test(redisSessionId)) {
        const sessionId = redisSessionId.split(':')[1];
        void this.prismaClient.user
          .findUnique({
            where: {
              session_id: sessionId,
            },
            select: {
              user_id: true,
            },
          })
          .then((user) => {
            if (user) {
              const userId = user.user_id;
              void this.logout(userId);
            }
          });
      }
    });

    userCachingService.logoutSubscribe((payload: string) => {
      const json = Event.fromJson(payload);
      const { senderId } = json;
      void this.logout(senderId);
    });
  }

  @HandlePrismaError(messages.USER)
  canSignup(): Promise<number> {
    return this.prismaClient.user.count();
  }

  @HandlePrismaError(messages.USER)
  signup(user: UserSignupType): Promise<UserCreatedReturnType> {
    return this.prismaClient.user.create({
      data: user as any,
      select: {
        email: true,
      },
    }) as any;
  }

  @HandlePrismaError(messages.USER)
  login(email: string): Promise<user> {
    return this.prismaClient.user.findUniqueOrThrow({
      where: {
        email,
      },
    });
  }

  async logout(userId: string): Promise<null> {
    await this.productCachingService.getProductsAccessByVisitor(userId).then((productIds) => {
      return Promise.all(
        productIds.map((productId) => {
          return this.productCachingService.removeVisitor(productId, userId);
        }),
      );
    });
    await this.reportCachingService.removeReportViewer(userId);
    return this.updateUserSessionId(userId, null).then(() => null);
  }

  checkUserLogged(sessionId: string): Promise<boolean> {
    return this.userCachingService.checkUserAlreadyLogged(sessionId).then((sessionString) => {
      if (sessionString) {
        return new LoginSessionPayload(JSON.parse(sessionString).user as LoginSessionPayload)
          .validate()
          .then((errors) => errors.length === 0);
      }
      return Promise.resolve(false);
    });
  }

  validateUserPermission(requestPayload: RequesterFromType, user: Pick<user, 'power'>): void {
    if (requestPayload.by) {
      if (requestPayload.by === APP_NAME.ADMIN) {
        if (user.power === POWER_NUMERIC.SALE) {
          throw new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_SALE_LOGIN));
        }
      } else {
        if ([POWER_NUMERIC.SUPER_ADMIN, POWER_NUMERIC.ADMIN].includes(user.power)) {
          throw new UnauthorizedException(createMessage(messages.USER.NOT_ALLOW_ADMIN_LOGIN));
        }
      }
    } else {
      throw new UnauthorizedException(createMessage(messages.COMMON.UNKNOWN_RESOURCE));
    }
  }

  @HandlePrismaError(messages.USER)
  updateUserSessionId(userId: string, sessionId: string | null): Promise<user> {
    return this.prismaClient.user.update({
      where: {
        user_id: userId,
      },
      data: {
        session_id: sessionId,
      },
    });
  }

  @HandlePrismaError(messages.USER, { NotFound: HttpStatus.UNAUTHORIZED })
  resetPassword(resetPassword: ResetPassword): Promise<Omit<user, 'phone' | 'password'>> {
    return this.prismaClient.user.update({
      where: {
        email: resetPassword.email,
      },
      data: {
        reset_password_token: null,
        password: resetPassword.password,
      },
      omit: {
        phone: true,
        password: true,
      },
    });
  }

  @HandlePrismaError(messages.USER, { NotFound: HttpStatus.UNAUTHORIZED })
  async refreshResetPasswordToken(
    refreshResetPasswordTokenBody: RefreshResetResetPasswordToken,
  ): Promise<RefreshResetPasswordTokenResponse> {
    const originPassword = autoGeneratePassword();
    return this.prismaClient.user
      .findFirstOrThrow({
        where: {
          reset_password_token: refreshResetPasswordTokenBody.token,
        },
        select: {
          user_id: true,
          email: true,
          power: true,
          active: true,
        },
      })
      .then((user) => {
        if (user.active === STATUS.BLOCK) {
          throw new UnauthorizedException(createMessage(messages.USER.YOU_WERE_BLOCKED));
        }

        this.validateUserPermission(refreshResetPasswordTokenBody, user);
        const resetPasswordToken = signingAdminResetPasswordToken({ email: user.email, password: originPassword });
        const resetPasswordLink = getResetPasswordLink(resetPasswordToken, user.power);
        return this.prismaClient.user
          .update({
            where: {
              user_id: user.user_id,
            },
            data: {
              password: originPassword,
              reset_password_token: resetPasswordToken,
            },
          })
          .then(() => ({
            password: originPassword,
            email: user.email,
            reset_password_link: resetPasswordLink,
          }));
      });
  }

  @HandlePrismaError(messages.USER)
  pagination(select: UserPagination): Promise<UserPaginationPrismaResponse> {
    const skip = calcSkip(select.pageSize, select.pageNumber);
    const condition = select.search
      ? {
          OR: [
            {
              first_name: {
                contains: select.search,
              },
            },
            {
              last_name: {
                contains: select.search,
              },
            },
          ],
        }
      : {};

    Object.assign(condition, { user_id: { not: select.requesterId } });

    return this.prismaClient.$transaction([
      this.prismaClient.user.findMany({
        take: select.pageSize,
        skip,
        select: select.query,
        where: condition,
        orderBy: {
          user_id: 'desc',
        },
      }),
      this.prismaClient.user.count({
        where: condition,
      }),
    ]);
  }

  @HandlePrismaError(messages.USER)
  getUser(where: Prisma.userWhereUniqueInput, select: Record<string, boolean>): Promise<any> {
    return this.prismaClient.user.findUniqueOrThrow({
      where,
      select,
    });
  }

  @HandlePrismaError(messages.USER)
  update(user: user): Promise<UserWithOnlySessionIDType> {
    return this.prismaClient.user
      .findUniqueOrThrow({
        where: {
          user_id: user.user_id,
        },
        select: {
          session_id: true,
        },
      })
      .then((userFound) => {
        return this.prismaClient.user
          .update({
            where: {
              user_id: user.user_id,
            },
            data: user,
          })
          .then(() => userFound);
      });
  }

  @HandlePrismaError(messages.USER)
  async delete(userId: string): Promise<UserWithOnlySessionIDType> {
    await this.prismaClient.bill
      .findMany({
        where: {
          user_id: userId,
        },
        select: {
          bill_id: true,
        },
      })
      .then((bills) => {
        const billIds = bills.map((bill) => bill.bill_id);
        return this.prismaClient.bill_detail.deleteMany({
          where: {
            bill_id: {
              in: billIds,
            },
          },
        });
      });

    return this.prismaClient
      .$transaction([
        this.prismaClient.bill.deleteMany({
          where: {
            user_id: userId,
          },
        }),
        this.prismaClient.user.delete({
          where: {
            user_id: userId,
          },
          select: {
            session_id: true,
          },
        }),
      ])
      .then((results) => results[1]);
  }

  @HandlePrismaError(messages.USER)
  updatePersonalInfo(user: user): Promise<user> {
    return this.prismaClient.user.update({
      where: {
        user_id: user.user_id,
      },
      data: user,
    });
  }

  @HandlePrismaError(messages.USER)
  updatePower(payload: UpdatePower): Promise<user> {
    return this.prismaClient.user
      .findUniqueOrThrow({
        where: {
          user_id: payload.user_id,
        },
      })
      .then(async (userFound) => {
        if (!userFound.reset_password_token) {
          return await this.prismaClient.user.update({
            where: {
              user_id: payload.user_id,
            },
            data: {
              power: payload.power,
            },
          });
        }
        throw new BadRequestException(createMessage(messages.USER.NOT_UPDATE_POWER_WHO_HAVE_FIRST_LOGIN));
      });
  }

  @HandlePrismaError(messages.USER)
  updateStatus(payload: UpdateStatus): Promise<user> {
    return this.prismaClient.user.update({
      where: {
        user_id: payload.user_id,
      },
      data: {
        active: payload.active,
      },
    });
  }
}

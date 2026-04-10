import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaClient, type user } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import messages from '@share/constants/messages';
import { HandlePrismaError } from '@share/decorators';
import type {
  UserCreatedReturnType,
  UserDetailType,
  UserPaginationPrismaResponse,
  UserSignupType,
  UserWithOnlySessionIDType,
} from '@share/interfaces';
import { calcSkip } from '@share/utils';
import { ResetPassword, UserPagination, LoginSessionPayload, UpdatePower } from '@share/dto/validators/user.dto';
import UserCachingService from '@share/libs/caching/user/user.service';
import ProductCachingService from '@share/libs/caching/product/product.service';
import ReportCachingService from '@share/libs/caching/report/report.service';

@Injectable()
export default class UserService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient,
    private readonly userCachingService: UserCachingService,
    private readonly productCachingService: ProductCachingService,
    private readonly reportCachingService: ReportCachingService,
  ) {}

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
  login(email: string): Promise<Omit<user, 'phone'>> {
    return this.prismaClient.user.findUniqueOrThrow({
      where: {
        email,
      },
      omit: {
        phone: true,
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

  @HandlePrismaError(messages.USER)
  getDetail(email: string, select: Record<string, boolean>): Promise<unknown> {
    return this.prismaClient.user.findUniqueOrThrow({
      where: {
        email,
      },
      select,
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
  getUser(select: UserDetailType): Promise<any> {
    return this.prismaClient.user.findUniqueOrThrow({
      where: {
        user_id: select.user_id,
      },
      select: select.query,
    });
  }

  @HandlePrismaError(messages.USER)
  update(user: user): Promise<UserWithOnlySessionIDType> {
    return this.prismaClient
      .$transaction([
        this.prismaClient.user.findUniqueOrThrow({
          where: {
            user_id: user.user_id,
          },
          select: {
            session_id: true,
          },
        }),
        this.prismaClient.user.update({
          where: {
            user_id: user.user_id,
          },
          data: user,
        }),
      ])
      .then((results) => results[0]);
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
    return this.prismaClient.user.update({
      where: {
        user_id: payload.user_id,
      },
      data: {
        power: payload.power,
      },
    });
  }
}

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaClient, type user } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import messages from '@share/constants/messages';
import { HandlePrismaError } from '@share/decorators';
import type { UserDetailType, UserPaginationPrismaResponse, UserSignupType } from '@share/interfaces';
import { calcSkip } from '@share/utils';
import { ResetPassword, UserPagination } from '@share/dto/validators/user.dto';

@Injectable()
export default class UserService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient) {}

  @HandlePrismaError(messages.USER)
  canSignup(): Promise<number> {
    return this.prismaClient.user.count();
  }

  @HandlePrismaError(messages.USER)
  signup(user: UserSignupType): Promise<Pick<user, 'email' | 'reset_password_token'>> {
    return this.prismaClient.user.create({
      data: user as any,
      select: {
        email: true,
        reset_password_token: true,
      },
    });
  }

  @HandlePrismaError(messages.USER)
  login(email: string): Promise<Omit<user, 'phone'>> {
    return this.prismaClient.user.findFirstOrThrow({
      where: {
        email,
      },
      omit: {
        phone: true,
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
  update(user: user): Promise<user> {
    return this.prismaClient.user.update({
      where: {
        user_id: user.user_id,
      },
      data: user,
    });
  }
}

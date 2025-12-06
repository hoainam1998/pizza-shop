import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaClient, type user } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import messages from '@share/constants/messages';
import { HandlePrismaError } from '@share/decorators';
import type { UserCreateType } from '@share/interfaces';
import { ResetPassword } from '@share/dto/validators/user.dto';

@Injectable()
export default class UserService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient) {}

  @HandlePrismaError(messages.USER)
  canSignup(): Promise<number> {
    return this.prismaClient.user.count();
  }

  @HandlePrismaError(messages.USER)
  signup(user: UserCreateType): Promise<user> {
    return this.prismaClient.user.create({
      data: user as any,
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
}

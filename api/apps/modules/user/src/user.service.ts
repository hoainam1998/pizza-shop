import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient, type user } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import messages from '@share/constants/messages';
import { HandlePrismaError } from '@share/decorators';
import type { UserCreateType } from '@share/interfaces';

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
  login(email: string): Promise<user> {
    return this.prismaClient.user.findFirstOrThrow({
      where: {
        email,
      },
    });
  }
}

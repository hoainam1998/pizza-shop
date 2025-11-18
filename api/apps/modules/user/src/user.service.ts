import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient, type user } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import messages from '@share/constants/messages';
import { HandlePrismaError } from '@share/decorators';

@Injectable()
export default class UserService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient) {}

  @HandlePrismaError(messages.USER)
  canSignup(): Promise<number> {
    return this.prismaClient.user.count();
  }

  @HandlePrismaError(messages.USER)
  signup(user: user): Promise<user> {
    return this.prismaClient.user.create({
      data: user,
    });
  }
}

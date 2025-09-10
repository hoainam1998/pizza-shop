import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient, user } from 'generated/prisma';
import { PRISMA_CLIENT } from '@share/di-token';
import constants from '@share/constants';

@Injectable()
export default class UsersService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient) {}

  canSignup(): Promise<number> {
    return this.prismaClient.user.count();
  }

  signup(user: user, canSignup: boolean): Promise<user> {
    user = canSignup ? { ...user, power: constants.POWER_NUMERIC.SUPER_ADMIN } : user;
    return this.prismaClient.user.create({
      data: user,
    });
  }
}

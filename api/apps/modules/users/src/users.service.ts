import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { PRISMA_CLIENT } from 'apps/share/di-token';

@Injectable()
export class UsersService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient) {}

  getHello(name: string): Promise<string> {
    return this.prismaClient.user.count().then((count) => count + ' ' + name);
  }
}

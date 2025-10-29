import { Provider } from '@nestjs/common';
import { PRISMA_CLIENT, REDIS_CLIENT } from './di-token';
import PrismaClient from './libs/prisma/prisma-client';
import RedisClient from './libs/redis-client/redis';

export const prismaClient: Provider = {
  provide: PRISMA_CLIENT,
  useValue: PrismaClient,
};

export const redisClient: Provider = {
  provide: REDIS_CLIENT,
  useValue: RedisClient.Instance,
};

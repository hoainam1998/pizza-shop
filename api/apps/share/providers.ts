import { Provider } from '@nestjs/common';
import { ALLOW_VALID_API_KEY_GUARD, PRISMA_CLIENT, REDIS_CLIENT } from './di-token';
import PrismaClient from './libs/prisma/prisma-client';
import RedisClient from './libs/redis-client/redis';
import AllowValidApiKeyGuard from './guards/allow-valid-api-key.service';

export const prismaClient: Provider = {
  provide: PRISMA_CLIENT,
  useValue: PrismaClient,
};

export const redisClient: Provider = {
  provide: REDIS_CLIENT,
  useValue: RedisClient.Instance,
};

export const allowValidApiKeyGuard: Provider = {
  provide: ALLOW_VALID_API_KEY_GUARD,
  useClass: AllowValidApiKeyGuard,
};

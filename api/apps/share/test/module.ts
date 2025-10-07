import { Module, Provider } from '@nestjs/common';
import { PRISMA_CLIENT, REDIS_CLIENT } from '@share/di-token';
import prisma from './pre-setup/mock/prisma';
import CachingModule from '@share/libs/caching/caching.module';
import RedisClient from '@share/libs/redis-client/redis';

const prismaClient: Provider = {
  provide: PRISMA_CLIENT,
  useValue: prisma,
};

const redisClient: Provider = {
  provide: REDIS_CLIENT,
  useValue: RedisClient.Instance,
};

@Module({
  imports: [CachingModule.register(redisClient)],
  providers: [prismaClient],
  exports: [prismaClient, CachingModule],
})
export default class ShareTestingModule {}

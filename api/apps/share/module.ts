import { Module, Provider } from '@nestjs/common';
import EnvironmentConfigModule from './environment-config/environment-config.module';
import SendEmailModule from './libs/mailer/mailer.module';
import PrismaClient from './libs/prisma/prisma-client';
import { PRISMA_CLIENT, REDIS_CLIENT } from './di-token';
import RedisClient from './libs/redis-client/redis';

const prismaClient: Provider = {
  provide: PRISMA_CLIENT,
  useValue: PrismaClient,
};

const redisClient: Provider = {
  provide: REDIS_CLIENT,
  useValue: RedisClient.Instance,
};

@Module({
  imports: [EnvironmentConfigModule, SendEmailModule],
  providers: [prismaClient, redisClient],
  exports: [prismaClient, redisClient, SendEmailModule],
})
export default class ShareModule {}

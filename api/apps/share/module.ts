import { Module, Provider } from '@nestjs/common';
import EnvironmentConfigModule from './environment-config/environment-config.module';
import SendEmailModule from './libs/mailer/mailer.module';
import PrismaClient from './libs/prisma/prisma-client';
import RedisClient from './libs/redis-client/redis';
import CachingModule from './libs/caching/caching.module';
import { PRISMA_CLIENT, REDIS_CLIENT } from './di-token';
import LoggingModule from './libs/logging/logging.module';
import SchedulerModule from './libs/scheduler/scheduler.module';

const prismaClient: Provider = {
  provide: PRISMA_CLIENT,
  useValue: PrismaClient,
};

const redisClient: Provider = {
  provide: REDIS_CLIENT,
  useValue: RedisClient.Instance,
};

@Module({
  imports: [
    EnvironmentConfigModule,
    SendEmailModule,
    CachingModule.register(redisClient),
    LoggingModule,
    SchedulerModule,
  ],
  providers: [prismaClient, redisClient],
  exports: [prismaClient, redisClient, SendEmailModule, CachingModule, SchedulerModule],
})
export default class ShareModule {}

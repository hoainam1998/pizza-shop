import { Module } from '@nestjs/common';
import EnvironmentConfigModule from './environment-config/environment-config.module';
import SendEmailModule from './libs/mailer/mailer.module';
import CachingModule from './libs/caching/caching.module';
import LoggingModule from './libs/logging/logging.module';
import SchedulerModule from './libs/scheduler/scheduler.module';
import { redisClient, prismaClient } from './providers';

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

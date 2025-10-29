import { Module } from '@nestjs/common';
import CachingModule from '@share/libs/caching/caching.module';
import SchedulerModule from '@share/libs/scheduler/scheduler.module';
import { redisClient, prismaClient } from '@share/providers';

@Module({
  imports: [CachingModule.register(redisClient), SchedulerModule],
  providers: [prismaClient],
  exports: [prismaClient, CachingModule, SchedulerModule],
})
export default class ShareTestingModule {}

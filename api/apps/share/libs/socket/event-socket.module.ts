import { Module } from '@nestjs/common';
import EventsGateway from './event-socket.gateway';
import { redisClient } from '@share/providers';
import CachingModule from '@share/libs/caching/caching.module';
import LoggingModule from '@share/libs/logging/logging.module';
import ReportCachingService from '@share/libs/caching/report/report.service';
import UserCachingService from '@share/libs/caching/user/user.service';

@Module({
  imports: [CachingModule.register(redisClient), LoggingModule],
  providers: [EventsGateway, ReportCachingService, UserCachingService, redisClient],
  exports: [EventsGateway, UserCachingService],
})
export default class EventsModule {}

import { Module } from '@nestjs/common';
import EventsGateway from './event-socket.gateway';
import { redisClient } from '@share/providers';
import CachingModule from '@share/libs/caching/caching.module';
import LoggingModule from '@share/libs/logging/logging.module';
import ReportCachingService from '@share/libs/caching/report/report.service';

@Module({
  imports: [CachingModule.register(redisClient), LoggingModule],
  providers: [EventsGateway, ReportCachingService, redisClient],
  exports: [EventsGateway],
})
export default class EventsModule {}

import { Module } from '@nestjs/common';
import { redisClient } from '@share/providers';
import CachingModule from '@share/libs/caching/caching.module';
import LoggingModule from '@share/libs/logging/logging.module';
import ReportCachingService from '@share/libs/caching/report/report.service';
import UserCachingService from '@share/libs/caching/user/user.service';
import SocketConnected from './event-socket/socket-connected';
import UserNotificationEventsGateway from './event-socket/user-notification';
import ProductNotificationEventsGateway from './event-socket/product-notification';

@Module({
  imports: [CachingModule.register(redisClient), LoggingModule],
  providers: [
    UserNotificationEventsGateway,
    ProductNotificationEventsGateway,
    SocketConnected,
    ReportCachingService,
    UserCachingService,
    redisClient,
  ],
  exports: [UserNotificationEventsGateway, ProductNotificationEventsGateway, UserCachingService],
})
export default class EventsModule {}

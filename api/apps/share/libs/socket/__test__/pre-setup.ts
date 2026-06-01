import { Test, TestingModule } from '@nestjs/testing';
import { redisClient } from '@share/providers';
import CachingModule from '@share/libs/caching/caching.module';
import LoggingModule from '@share/libs/logging/logging.module';
import ReportCachingService from '@share/libs/caching/report/report.service';
import LoggingService from '@share/libs/logging/logging.service';
import UserCachingService from '@share/libs/caching/user/user.service';
import SocketConnected from '../event-socket/socket-connected';
import UserNotificationEventsGateway from '../event-socket/user-notification';
import ProductNotificationEventsGateway from '../event-socket/product-notification';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [CachingModule.register(redisClient), LoggingModule],
    providers: [
      UserNotificationEventsGateway,
      ProductNotificationEventsGateway,
      SocketConnected,
      ReportCachingService,
      UserCachingService,
      redisClient,
    ],
  })
    .overrideProvider(ReportCachingService)
    .useValue({
      getAllReportViewer: jest.fn(),
      checkExist: jest.fn(),
      addReportViewer: jest.fn(),
    })
    .overrideProvider(LoggingService)
    .useValue({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    })
    .compile();
};

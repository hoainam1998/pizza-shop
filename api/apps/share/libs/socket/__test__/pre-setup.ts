import { Test, TestingModule } from '@nestjs/testing';
import EventsGateway from '../event-socket.gateway';
import { redisClient } from '@share/providers';
import CachingModule from '@share/libs/caching/caching.module';
import LoggingModule from '@share/libs/logging/logging.module';
import ReportCachingService from '@share/libs/caching/report/report.service';
import LoggingService from '@share/libs/logging/logging.service';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [CachingModule.register(redisClient), LoggingModule],
    providers: [EventsGateway, ReportCachingService],
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

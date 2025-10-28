import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';
import SchedulerService from '../scheduler.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ScheduleModule.forRoot(), LoggingModule],
    providers: [SchedulerService],
  })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};

import { Test, TestingModule } from '@nestjs/testing';
import { redisClient } from '@share/providers';
import ReportCachingModule from '../report.module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ReportCachingModule.register(redisClient)],
  }).compile();
};

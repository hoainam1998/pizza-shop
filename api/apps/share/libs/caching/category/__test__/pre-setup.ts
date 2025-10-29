import { Test, TestingModule } from '@nestjs/testing';
import CategoryCachingModule from '../category.module';
import { redisClient } from '@share/providers';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [CategoryCachingModule.register(redisClient)],
  }).compile();
};

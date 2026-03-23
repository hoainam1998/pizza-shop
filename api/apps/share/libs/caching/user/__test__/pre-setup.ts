import { Test, TestingModule } from '@nestjs/testing';
import { redisClient } from '@share/providers';
import UserCachingModule from '../user.module';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [UserCachingModule.register(redisClient)],
  }).compile();
};

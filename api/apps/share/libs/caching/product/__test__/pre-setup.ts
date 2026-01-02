import { Test, TestingModule } from '@nestjs/testing';
import ProductCachingModule from '../product.module';
import { redisClient } from '@share/providers';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [ProductCachingModule.register(redisClient)],
  }).compile();
};

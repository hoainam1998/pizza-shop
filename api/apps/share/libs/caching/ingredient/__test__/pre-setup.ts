import { Test, TestingModule } from '@nestjs/testing';
import IngredientCachingModule from '../ingredient.module';
import { redisClient } from '@share/providers';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [IngredientCachingModule.register(redisClient)],
  }).compile();
};

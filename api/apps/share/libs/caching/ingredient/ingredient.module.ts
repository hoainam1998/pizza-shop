import { DynamicModule, Module, Provider } from '@nestjs/common';
import IngredientCachingService from './ingredient.service';

@Module({})
export default class IngredientCachingModule {
  static register(redisClient: Provider): DynamicModule {
    return {
      module: IngredientCachingModule,
      providers: [redisClient, IngredientCachingService],
      exports: [IngredientCachingService],
    };
  }
}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import CategoryCachingModule from './category/category.module';
import IngredientCachingModule from './ingredient/ingredient.module';

@Module({})
export default class CachingModule {
  static register(redisProvider: Provider): DynamicModule {
    return {
      module: CachingModule,
      imports: [CategoryCachingModule.register(redisProvider), IngredientCachingModule.register(redisProvider)],
      exports: [CategoryCachingModule, IngredientCachingModule],
    };
  }
}

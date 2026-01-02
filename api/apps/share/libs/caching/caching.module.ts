import { DynamicModule, Module, Provider } from '@nestjs/common';
import CategoryCachingModule from './category/category.module';
import IngredientCachingModule from './ingredient/ingredient.module';
import ProductCachingModule from './product/product.module';

@Module({})
export default class CachingModule {
  static register(redisProvider: Provider): DynamicModule {
    return {
      module: CachingModule,
      imports: [
        CategoryCachingModule.register(redisProvider),
        IngredientCachingModule.register(redisProvider),
        ProductCachingModule.register(redisProvider),
      ],
      exports: [CategoryCachingModule, IngredientCachingModule, ProductCachingModule],
    };
  }
}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import ProductCachingService from './product.service';

@Module({})
export default class ProductCachingModule {
  static register(redisClient: Provider): DynamicModule {
    return {
      module: ProductCachingModule,
      providers: [redisClient, ProductCachingService],
      exports: [ProductCachingService],
    };
  }
}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import CategoryCachingService from './category.service';

@Module({})
export default class CategoryCachingModule {
  static register(redisClient: Provider): DynamicModule {
    return {
      module: CategoryCachingModule,
      providers: [redisClient, CategoryCachingService],
      exports: [CategoryCachingService],
    };
  }
}

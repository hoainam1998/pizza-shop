import { DynamicModule, Module, Provider } from '@nestjs/common';
import CategoryCachingService from './category.service';

@Module({})
export default class CategoryCachingModule {
  static register(prismaProvider: Provider): DynamicModule {
    return {
      module: CategoryCachingModule,
      providers: [prismaProvider, CategoryCachingService],
      exports: [CategoryCachingService],
    };
  }
}

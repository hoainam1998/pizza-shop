import { DynamicModule, Module, Provider } from '@nestjs/common';
import CategoryCachingModule from './category/category.module';

@Module({})
export default class CachingModule {
  static register(prismaProvider: Provider): DynamicModule {
    return {
      module: CachingModule,
      imports: [CategoryCachingModule.register(prismaProvider)],
      exports: [CategoryCachingModule],
    };
  }
}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import IngredientCachingService from './ingredient.service';

@Module({})
export default class IngredientCachingModule {
  static register(prismaProvider: Provider): DynamicModule {
    return {
      module: IngredientCachingModule,
      providers: [prismaProvider, IngredientCachingService],
      exports: [IngredientCachingService],
    };
  }
}

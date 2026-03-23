import { DynamicModule, Module, Provider } from '@nestjs/common';
import UserCachingService from './user.service';

@Module({})
export default class UserCachingModule {
  static register(redisClient: Provider): DynamicModule {
    return {
      module: UserCachingModule,
      providers: [redisClient, UserCachingService],
      exports: [UserCachingService],
    };
  }
}

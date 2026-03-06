import { DynamicModule, Module, Provider } from '@nestjs/common';
import ReportCachingService from './report.service';

@Module({})
export default class ReportCachingModule {
  static register(redisClient: Provider): DynamicModule {
    return {
      module: ReportCachingModule,
      providers: [redisClient, ReportCachingService],
      exports: [ReportCachingService],
    };
  }
}

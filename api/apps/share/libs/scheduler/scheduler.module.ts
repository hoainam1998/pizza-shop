import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import SchedulerService from './scheduler.service';
import LoggingModule from '../logging/logging.module';

@Module({
  imports: [ScheduleModule.forRoot(), LoggingModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export default class SchedulerModule {}

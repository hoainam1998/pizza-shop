import { Logger, Module } from '@nestjs/common';
import LoggerService from './logging.service';

@Module({
  providers: [Logger, LoggerService],
  exports: [LoggerService],
})
export default class LoggingModule {}

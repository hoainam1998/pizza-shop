import { Injectable, Logger } from '@nestjs/common';
import { HandleContextLogging } from '@share/decorators';

@Injectable()
export default class LoggingService {
  constructor(private readonly logger: Logger) {}

  @HandleContextLogging
  log(message: string, context: string) {
    this.logger.log(message, context);
  }

  @HandleContextLogging
  warn(message: string, context: string) {
    this.logger.warn(message, context);
  }

  @HandleContextLogging
  error(message: string, context: string) {
    this.logger.error(message, context);
  }
}

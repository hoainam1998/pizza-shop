import { Injectable, Logger } from '@nestjs/common';
import { HandleContextLogging } from '@share/decorators';

@Injectable()
export default class LoggingService {
  constructor(private readonly logger: Logger) {}

  @HandleContextLogging
  log(message: string, context: string) {
    this.logger.log(message, context);
  }
}

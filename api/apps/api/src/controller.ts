import LoggingService from '@share/libs/logging/logging.service';
import { getExceptionMessages, getControllerContext } from '@share/utils';
import { ValidationError } from 'class-validator';

/**
 * Provide helper feature for controller.
 * @class
 */
export default class {
  private _loggingService: LoggingService;
  private _context: ReturnType<typeof getControllerContext>;

  constructor(loggingService: LoggingService, context: string) {
    this._loggingService = loggingService;
    this._context = getControllerContext(context);
  }

  protected logError(errors: ValidationError[], actionName: string): void {
    this._loggingService.error(getExceptionMessages(errors), this._context(actionName));
  }
}

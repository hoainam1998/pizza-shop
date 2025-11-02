import { BadRequestException, ValidationError, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { handleValidateException } from '@share/utils';

/**
 * Get validate pipe object.
 *
 * @param {ValidationPipeOptions} [options] - The validate options.
 * @returns {ValidationPipe} - The validate pipe instance.
 */
const getValidationPipe = (options?: ValidationPipeOptions): ValidationPipe => {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (exceptions: ValidationError[]) => {
      const messages = handleValidateException(exceptions);
      throw new BadRequestException({ messages });
    },
    ...options,
  });
};

/**
 * Global validate helper class.
 * @class
 */
export default class GlobalValidatePipe {
  private static readonly _instance = getValidationPipe();

  /**
   * Return validate pipe instance.
   *
   * @param {ValidationPipeOptions} [options] - The validate options.
   * @returns {ValidationPipe} - The validate pipe instance.
   */
  public static getInstance(options?: ValidationPipeOptions): ValidationPipe {
    return options ? getValidationPipe(options) : GlobalValidatePipe._instance;
  }
}

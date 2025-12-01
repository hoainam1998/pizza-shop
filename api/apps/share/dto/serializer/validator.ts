import { validate, ValidatorOptions } from 'class-validator';

const defaultValidateOption: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

/**
 * Validate output response.
 *
 * @class
 */
export default class {
  validate(options: ValidatorOptions = defaultValidateOption) {
    return validate(this, options);
  }
}

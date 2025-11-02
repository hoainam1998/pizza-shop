import { validate } from 'class-validator';

/**
 * Validate output response.
 *
 * @class
 */
export default class {
  validate() {
    return validate(this);
  }
}

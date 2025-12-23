import type { Directive } from 'vue';

/**
 * Directive base.
 *
 * @class
 * @abstract
 */
export default abstract class {
  /**
   * Directive name.
   */
  abstract readonly name: string;

  /**
   * Directive object.
   */
  abstract readonly directive: Directive;
}

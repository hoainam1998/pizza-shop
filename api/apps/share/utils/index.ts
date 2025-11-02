import { ValidationError } from 'class-validator';
import { EventPatternType } from '../interfaces';
import {
  passwordHashing,
  autoGeneratePassword,
  signingAdminResetPasswordToken,
  getAdminResetPasswordLink,
} from './auth';
import { createMessage, createMessages } from './message';

/**
 * Create microservice event.
 *
 * @param {string} pattern - The microservice pattern event.
 * @returns {{
 * cmd: string}} - The pattern object.
 */
const createMicroserviceEvent = (pattern: string): EventPatternType => ({ cmd: pattern });

/**
 * Convert file to base64 image file string.
 *
 * @param {Express.Multer.File} file - The file object.
 * @return {string} The image base64 string.
 */
const convertFileToBase64 = (file: Express.Multer.File): string =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

/**
 * Check array is empty or not.
 *
 * @param {*[]} array - An array checking.
 * @returns {boolean} - The checking result.
 */
const checkArrayHaveValues = (array: any[]) => Array.isArray(array) && array.length > 0;

/**
 * Return a skip property.
 *
 * @param {number} pageSize - Page size.
 * @param {number} pageNumber - Page number.
 * @returns {number} - A skip property.
 */
const calcSkip = (pageSize: number, pageNumber: number) => (pageNumber - 1) * pageSize;

/**
 * Get all errors message.
 *
 * @param {ValidationError[]} exceptions - The exceptions list.
 * @returns {string[]} - The errors message.
 */
const handleValidateException = (exceptions: ValidationError[]): string[] => {
  return exceptions.reduce<string[]>((messages: string[], exception: ValidationError) => {
    if (exception.constraints) {
      messages = messages.concat(Object.values(exception.constraints));
    }

    if (exception.children) {
      const messagesChild = handleValidateException(exception.children || []);
      messages = messages.concat(messagesChild);
    }

    return messages;
  }, []);
};
/**
 * Convert date object to date time string.
 *
 * @param {Date} date - The date object.
 * @returns {string} - The date time information string.
 */
const formatDateTime = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Select specific fields for a list.
 *
 * @param {T extends object} select - The select object.
 * @param {R extends Array<any>} list - The origin list.
 * @returns {Partial<R>[]} - A list after select.
 */
const selectFields = <T extends object, R extends object>(select: T, list: R[]): Partial<R>[] => {
  return list.map((item) =>
    Object.entries(select).reduce<Partial<R>>((obj, [key, value]: [unknown, any]) => {
      if (value) {
        obj[key as keyof R] = item[key as keyof R];
      }
      return obj;
    }, {}),
  );
};

/**
 * Get exception messages.
 *
 * @param {ValidationError[]} errors - The errors
 * @returns {string} - A messages.
 */
const getExceptionMessages = (errors: ValidationError[]): string => {
  return handleValidateException(errors)
    .reduce((messages, message, index) => {
      messages += `${index + 1}: ${message} \n`;
      return messages;
    }, '')
    .trim();
};

/**
 * Return context with action name.
 *
 * @callback returnFullContextName
 * @param {string} actionName - The actionName
 * @returns {string} - The full context name.
 */

/**
 * Get exception messages.
 *
 * @param {string} controllerName - The controller name.
 * @returns {returnFullContextName} The callback will return the full context name.
 */
const getControllerContext = (controllerName: string) => (actionName: string) => `${controllerName} - ${actionName}`;

export {
  createMicroserviceEvent,
  createMessage,
  createMessages,
  convertFileToBase64,
  checkArrayHaveValues,
  passwordHashing,
  autoGeneratePassword,
  signingAdminResetPasswordToken,
  getAdminResetPasswordLink,
  calcSkip,
  handleValidateException,
  formatDateTime,
  selectFields,
  getExceptionMessages,
  getControllerContext,
};

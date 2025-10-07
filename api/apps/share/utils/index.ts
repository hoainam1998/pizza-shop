import { ValidationError } from 'class-validator';
import { EventPatternType, MessageResponseType } from '../interfaces';
import {
  passwordHashing,
  autoGeneratePassword,
  signingAdminResetPasswordToken,
  getAdminResetPasswordLink,
} from './auth';

/**
 * Create microservice event.
 *
 * @param {string} pattern - The microservice pattern event.
 * @returns {{
 * cmd: string}} - The pattern object.
 */
const createMicroserviceEvent = (pattern: string): EventPatternType => ({ cmd: pattern });

/**
 * Create message response.
 *
 * @param {string} message - The message.
 * @returns {{
 * message: string
 * errorCode: string}} - The message object.
 */
const createMessage = (message: string, errorCode?: string): MessageResponseType => ({ message, errorCode });

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

export {
  createMicroserviceEvent,
  createMessage,
  convertFileToBase64,
  checkArrayHaveValues,
  passwordHashing,
  autoGeneratePassword,
  signingAdminResetPasswordToken,
  getAdminResetPasswordLink,
  calcSkip,
  handleValidateException,
};

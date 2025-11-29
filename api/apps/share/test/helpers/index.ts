import { HttpStatus } from '@nestjs/common';
import path from 'path';
import { MessageResponseTestingType } from '@share/interfaces';

/**
 * Get test static file.
 *
 * @param {string} filePath - The file path.
 * @return {string} - The absolute file path.
 */
export const getStaticFile = (filePath: string): string => {
  return path.join(process.cwd(), 'apps/share/test/static/images', filePath);
};

/**
 * Get describe api test.
 *
 * @param {HTTP_METHOD} method - The request method.
 * @param {string} url - The url.
 * @return {string} - The describe api test.
 */
export const createDescribeTest = (method: string, url: string): string => `${method} - ${url}`;

/**
 * Create test name.
 *
 * @param {string} name - The test name.
 * @param {HttpStatus} status - The http status.
 * @returns {string} - The final test name.
 */
export const createTestName = (name: string, status: HttpStatus): string => `${name} - ${status}`;

/**
 * Create message response for testing.
 *
 * @param {string} message - The message.
 * @returns {{
 * messages: string[]
 * errorCode: string
 * }} - The message object.
 */
export const createMessagesTesting = (message: string, errorCode?: string): MessageResponseTestingType => {
  return Object.assign({ messages: [message] }, errorCode ? { errorCode } : {});
};

import { HttpStatus } from '@nestjs/common';
import path from 'path';

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

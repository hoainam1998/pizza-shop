import { expect } from '@jest/globals';
import toBeImageBase64 from './toBeBase64';

expect.extend({
  toBeImageBase64,
});

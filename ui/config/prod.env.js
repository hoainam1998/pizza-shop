/* eslint-disable @typescript-eslint/no-require-imports */
const devConfig = require('./dev.env');

module.exports = Object.assign(devConfig, {
  NODE_ENV: 'production',
});

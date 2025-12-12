/* eslint-disable @typescript-eslint/no-require-imports */
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const { OUTPUT_DIR } = require('./config.js');
const { dev } = require('../config');
const portfinder = require('portfinder');
const notifier = require('node-notifier');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

const devConfig = (env) =>
  merge(common(env), {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      static: OUTPUT_DIR,
      open: true,
      hot: true,
      port: env.APP_NAME === 'sale' ? dev.SALE_PORT : dev.ADMIN_PORT,
      historyApiFallback: true,
      client: {
        overlay: {
          runtimeErrors: (error) => {
            const ignoreErrors = [
              'ResizeObserver loop limit exceeded',
              'ResizeObserver loop completed with undelivered notifications.',
            ];
            if (ignoreErrors.includes(error.message)) {
              return false; // Don't show overlay for these specific errors
            }
            return true; // Show overlay for other errors
          },
        },
      },
    },
  });

module.exports = (env) => {
  const developmentConfig = devConfig(env);
  return new Promise((resolve, reject) => {
    portfinder.basePort = developmentConfig.devServer.port;
    portfinder.getPort(function (err, port) {
      if (err) {
        notifier.notify({
          title: 'Webpack config port error!',
          message: `Something wrong when using ${port}: ${err.message}!`,
        });
        reject(err);
      } else {
        developmentConfig.plugins.push(
          new FriendlyErrorsWebpackPlugin({
            complicationSuccessInfo: {
              messages: [`You application is running here http://localhost:${port}`],
            },
            onErrors: function (severity, errors) {
              if (severity === 'error') {
                const error = errors[0];
                notifier.notify({
                  title: 'Webpack error!',
                  message: `${severity}: ${error.name}`,
                  subtitle: error.file,
                });
              }
            },
          }),
        );
        notifier.notify({
          title: 'Webpack config port success.',
          message: `Your application running on ${port}`,
        });
        developmentConfig.devServer.port = port;
        resolve(developmentConfig);
      }
    });
  });
};

/* eslint-disable @typescript-eslint/no-require-imports */
const svgToMiniDataURI = require('mini-svg-data-uri');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const sass = require('sass');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { getResolvePath, getAssetPath } = require('./utils');
const { dev } = require('../config');
const { OUTPUT_DIR, PUBLIC_PATH, PUBLIC, SRC } = require('./config');
const breakPoints = require('../src/assets/js/break-points.js');

const getEnv = (env) => {
  return {
    'process.env': JSON.stringify({ ...dev, ...env }),
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    isSale: env.APP_NAME === 'sale',
  };
};

module.exports = (envArgs) => ({
  entry: getResolvePath(`${SRC}//main.ts`),
  output: {
    filename: 'js/[name].bundle.js',
    path: getResolvePath(OUTPUT_DIR),
    publicPath: PUBLIC_PATH,
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Pizza shop',
      favicon: getAssetPath(PUBLIC, 'favicon.ico'),
      template: getAssetPath(PUBLIC, 'index.html'),
    }),
    new DefinePlugin(getEnv(envArgs)),
    new ESLintPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new VueLoaderPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      '@': getResolvePath(SRC),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
        },
      },
      {
        test: /\.(c|sa|sc)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: {
                auto: true,
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              api: 'modern-compiler',
              sassOptions: {
                functions: {
                  'getResponsiveBreakpoint($key)': function (args) {
                    const point = args[0];
                    return new sass.types.String(`${breakPoints[point] || 0}px`).dartValue;
                  },
                },
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'image/[hash][ext][query]',
        },
      },
      {
        test: /\.svg/,
        type: 'asset/inline',
        generator: {
          dataUrl: (content) => {
            content = content.toString();
            return svgToMiniDataURI(content);
          },
        },
      },
    ],
  },
});

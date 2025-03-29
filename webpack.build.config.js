const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js', // Entry for React front end
  target: 'web',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2020,
          mangle: { safari10: true },
          compress: { drop_console: true },
          output: { comments: false },
        },
        exclude: /node_modules/,
      }),
    ],
  },

  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
              '@babel/preset-react',
            ],
            plugins: ['@babel/plugin-proposal-private-methods'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
      chunkFilename: '[id].css',
    }),
    ...(process.env.NODE_ENV === 'development' ? [new webpack.HotModuleReplacementPlugin()] : []),
  ],

  resolve: {
    alias: {
      'react-pdf': 'react-pdf/dist/esm/react-pdf.browser',
    },
  },

  stats: {
    all: false,
    warnings: true,
    errors: true,
    errorDetails: true,
  },

  devtool: 'source-map',
};

const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack'); // Add this line

module.exports = {
  devtool: 'source-map', // Enables source maps for easier debugging
  module: {

    rules: [
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader', // Use PostCSS (Tailwind) to process CSS
        ],
      },
      {
        test: /\.jsx?$/,
        use: [{ loader: 'babel-loader', options: { compact: false } }],
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: 'file-loader', options: { name: 'img/[name]__[hash:base64:5].[ext]' } }],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'font/[name]__[hash:base64:5].[ext]' },
          },
        ],
      },
    ],
  },
  target: 'electron-renderer',
  entry: './src/index.js', // Adjust based on your entry file location
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'React Electron App' }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    process.env.NODE_ENV === 'production' &&
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css', // Cache busting in production
        chunkFilename: '[id].[contenthash].css',
      }),
  ].filter(Boolean), // Ensure that MiniCssExtractPlugin is only added in production
  devtool: 'cheap-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'), // Replaces contentBase
    },
    client: {
      logging: 'info', // Default logging behavior
      overlay: true, // Show full-screen overlay in the browser for errors
      progress: true, // Show progress bar during build
    },
    setupMiddlewares: (middlewares, devServer) => {
      // Spawn Electron for hot-reloading
      const electronProcess = spawn('electron', ['.'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      });

      electronProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Electron process exited with code ${code}`);
        }
        process.exit(0); // Exit the process gracefully after Electron closes
      });

      electronProcess.on('error', (spawnError) => {
        console.error('Error spawning Electron:', spawnError);
      });

      // Return the middlewares (required for `setupMiddlewares`)
      return middlewares;
    },
    hot: true, // Enable hot-reloading
    host: '0.0.0.0', // Allow access from other devices
  },
};

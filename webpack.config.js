const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './frontend/app.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'miner.js'
  },

  devtool: 'source-map',

  watch: true,
  watchOptions: {
    aggregateTimeout: 100
  },

  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: "handlebars-loader"
      },
      {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }
    ]
  },

  plugins: [
    new UglifyJsPlugin({
      sourceMap: true
    })
  ]
}

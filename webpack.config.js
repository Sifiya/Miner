const path = require('path');

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
      }
    ]
  }
}

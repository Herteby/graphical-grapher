const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin  = require('extract-text-webpack-plugin')

module.exports = {
  entry: './src/GraphicalGrapher.vue',
  output: {
    filename: './lib/GraphicalGrapher.js',
    libraryTarget: 'umd',
    library: 'GraphicalGrapher',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  externals: {
    lodash: 'lodash'
  },
  plugins: [
    new ExtractTextPlugin('dist/styles.min.css', { 
      disable: process.env.NODE_ENV === 'production'
    }),
    new webpack.optimize.UglifyJsPlugin( {
      minimize : true,
      sourceMap : false,
      mangle: true,
      compress: {
        warnings: false
      }
    } )
  ]
}
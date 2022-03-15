const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
 mode: 'development',
 devtool: 'inline-source-map',
 watch:true,
 devServer: {
   contentBase: path.join(__dirname, "build/"),
 },
 plugins: [
   new HtmlWebpackPlugin({
        hash: true,
        filename: path.join(__dirname, "build/index.html")
    })
 ]
});

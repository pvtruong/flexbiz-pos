const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = merge(common, {
 plugins: [
   new webpack.DefinePlugin({
     'process.env.NODE_ENV': '"production"'
   }),
   //new BundleAnalyzerPlugin()
 ],
 mode: 'production',
});

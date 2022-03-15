const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const config = require("./config.js");
const htmlTemplate = require("./htmlTemplate.js"); 
class SaveConfigs {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('Webpack save Configs plugin', (compilation, callback) => {
      let config_string =`
        var endpoint,key,authSecret;
        var appConfig={
          server_url:"${config.server_url}",
          server_url_report:"${config.server_url_report}",
          print_service_url:"${config.print_service_url||""}",
          id_app:"${config.id_app}",
          group_id:"${config.group_id}",
          public_token:"${config.public_token}",
          app_title:"${config.app_title}",
          app_name:"${config.app_name}",
          app_name_en:"${config.app_name_en}",
          sologan_en:"${config.sologan_en}",
          sologan:"${config.sologan}",
          app_description:"${config.app_description}",
          app_address:"${config.app_address}",
          app_phone:"${config.app_phone}",
          app_email:"${config.app_email}",
          primaryColor:"${config.primaryColor}",
          secondaryColor:"${config.secondaryColor}",
          mainColor:"${config.mainColor}",
          titleColor:"${config.titleColor}",
          iconColor:"${config.iconColor}",
          progressColor:"${config.progressColor}",
          mainTextColor:"${config.mainTextColor||'#ffffff'}",
          printPageWidth:"${config.printPageWidth}",
          GOOGLE_MAPS_APIKEY:"",
          GOOGLE_RECAPTCHA_SITE_KEY:"${config.GOOGLE_RECAPTCHA_SITE_KEY}",
          menu:[
            ${config.menu.map(item=>{
                return JSON.stringify(item) + ",";
              }).join('\n')
            }
          ]
        }
      `
      const pathConfig = `${__dirname}/build/configs.js`;
      require('fs').writeFile(pathConfig, config_string, function (err) {
        if (err){
          console.error(err);
        }else{
          console.log('created config file for client');
        }
        callback();
      });
    });
  }
}
class saveHtmlTemplate{
  apply(compiler) {
    compiler.hooks.emit.tapAsync('Webpack save index.html', (compilation, callback) => {
      let html = htmlTemplate();
      const pathConfig = `${__dirname}/build/index.html`;
      require('fs').writeFile(pathConfig, html, function (err) {
        if (err){
          console.error(err);
        }else{
          console.log('created index.html file');
        }
        callback();
      });
    });
  }
}

module.exports = {
  entry: ["babel-polyfill",'./index.js'],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
    new SaveConfigs(),
    new saveHtmlTemplate()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)\/(?!(flexbiz-core)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react']
          }
        }
      },
      {
        test: /\.css$/,
        use: [ { loader: "style-loader" },{ loader: 'css-loader' }]
      },
      {
				test: /\.svg$/,
				use: [ 'raw-loader' ]
			},
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
            {
                loader: 'url-loader',
                options: {
                    limit: 8192
                }
            }
        ]
      },
      {
          test: /\.(woff(2)?|ttf|eot|mp3|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
              loader: 'file-loader',
              options: {
                  name: '[name].[ext]',
                  outputPath: 'fonts/'
              }
          }]
      }
    ]
  },
  output: {
    filename: 'app.min.js',
    chunkFilename: '[name].app.min.js',
    publicPath: '/dist/',
    path:`${__dirname}/build/dist`
  }
};
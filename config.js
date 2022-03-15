const DEFAULT_CONFIG = require("./src/apps/pos/config.json");
// eslint-disable-next-line no-undef
const CLIENT_SETTING = (typeof window !== 'undefined' && window.appConfig)?appConfig:{};
const config = Object.assign({},DEFAULT_CONFIG,CLIENT_SETTING);
if(!config.menu)  config.menu =[]
if(!config.primaryColor) config.primaryColor = '#013659'//'#013659';//`#EE7220`
if(!config.mainColor) config.mainColor = config.primaryColor;
if(!config.formHeaderColor) config.formHeaderColor = config.primaryColor;
if(!config.secondaryColor) config.secondaryColor = '#592401'//'#592401';//`#209CEE`
if(!config.progressColor) config.progressColor = config.secondaryColor;
if(!config.iconColor) config.iconColor = config.secondaryColor;
if(!config.titleColor) config.titleColor = config.secondaryColor;
if(!config.id_app) config.id_app_dynamic = true;
if (typeof window !== 'undefined') {
    if(!config.id_app) config.id_app  = localStorage.getItem("id_app");
}
module.exports= config;

import 'babel-polyfill';
import config,{facebook_page_id,facebook_app_id,facebook_greeting,mainColor,GOOGLE_RECAPTCHA_SITE_KEY,USE_HASH_ROUTER} from "./config.js";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import facebook from 'flexbiz-core/components/social/facebook';
import google from 'flexbiz-core/components/social/google';
import { BrowserRouter,HashRouter } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
//disabled all console info
console.info = function() {}
//
//cachedData.data = window.__data__;
class ClientApp extends React.Component{
  constructor(props){
    super(props);
    this.state={}
  }
  async componentDidMount(){
    const {default:routes} = await import("./routes")
    const {default:App} = await import("flexbiz-core")
    this.setState({routes,App},()=>{
      //load facebook
      if(facebook_app_id){
        facebook(facebook_app_id,FB => {
          if(facebook_page_id) FB.CustomerChat.show(true)
        });
      }
      //load google recaptcha
      if(GOOGLE_RECAPTCHA_SITE_KEY){
        google(GOOGLE_RECAPTCHA_SITE_KEY,()=>{
        })
      }
    })
  }
  render(){
    const {routes,App} = this.state;
    if(!routes) return null;
    let Router;
    if(USE_HASH_ROUTER){
      Router = HashRouter;
    }else{
      Router = BrowserRouter;
    }
    return (
      <Router>
        <App config={config} routes={routes}/>
        {!!facebook_app_id &&
          <div id="fb-root"></div>
        }
        {facebook_page_id && facebook_app_id?
          <div className="fb-customerchat"
            attribution="setup_tool"
            page_id={facebook_page_id}
            theme_color={mainColor}
            logged_in_greeting={facebook_greeting}
            logged_out_greeting={facebook_greeting}>
          </div>
          :
        null}
      </Router>
    )
  }
}

//ReactDOM.hydrate(<ClientApp />, document.getElementById('root'));
ReactDOM.render(<ClientApp />, document.getElementById('root'));

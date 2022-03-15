import React,{Component} from 'react';
import {withRouter} from 'react-router-dom';
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
import RequireLogin from "flexbiz-core/components/RequireLogin";
import PropTypes from 'prop-types';
import queryString from 'query-string';
class Dashboard extends React.Component{
  constructor(props){
    super(props);
    this.state={
    }
  }
  async componentDidMount(){
    const {default:DashboardComponent} = await import("flexbiz-core/components/dashboard/Dashboard");
    this.setState({
      DashboardComponent:DashboardComponent
    })
  }
  render(){
    if(!this.state.DashboardComponent) return null;
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
        <this.state.DashboardComponent {...this.props}/>
      </div>
    )
  }
}
Dashboard.contextType = AuthContext;
Dashboard.propTypes={
  history:PropTypes.any,
}
class DashboardPage extends Component{
  constructor(props){
    super(props)
    this.state={
      ready:false
    }
  }
  async componentDidMount(){
    const query = queryString.parse(this.props.location.search);
    if(query.id_app && query.access_token){
      if(localStorage.getItem("id_app")!==query.id_app || localStorage.getItem("token")!==query.access_token){
        await this.context.signout();
        localStorage.setItem("id_app",query.id_app);
        localStorage.setItem("token",query.access_token);
        this.context.config.id_app = query.id_app;
      }
    }else{
      await this.context.signout();
    }
    this.setState({ready:true});
  }
  render(){
    if(!this.state.ready) return null;
    return (
      <RequireLogin {...this.props}>
        <Dashboard {...this.props} id="ERP" />
      </RequireLogin>
    )
  }
}
DashboardPage.contextType = AuthContext;
DashboardPage.propTypes={
  location:PropTypes.any,
}
export default  withRouter(withMediaQuery('(max-width:480px)')(DashboardPage));

import React,{Component} from 'react';
import {withRouter} from 'react-router-dom';
import Container from './Container'
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
import PropTypes from 'prop-types';
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
  render(){
    return (
      <Container {...this.props} requireLogin showDrawerIfIsDesktop={false}>
        <Dashboard {...this.props} id="POS" />
      </Container>
    )
  }
}
export default  withRouter(withMediaQuery('(max-width:480px)')(DashboardPage));

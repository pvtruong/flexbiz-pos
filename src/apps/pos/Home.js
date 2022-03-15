import React,{Component} from 'react';
import {withRouter} from 'react-router-dom';
import Container from './Container'
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
import Shops from "./components/Shops";
import PropTypes from 'prop-types';
import Frag from "flexbiz-core/components/Frag";
//import {getLabel} from '../../API';
class Home extends React.Component{
  constructor(props){
    super(props);
    this.state={
    }
  }
  async componentDidMount(){
  }
  render(){
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
        <Frag style={{flexGrow:1}} title={this.context.apis.getLabel("Danh sách cửa hàng")}>
          <Shops {...this.props}/>
        </Frag>
      </div>
    )
  }
}
Home.contextType = AuthContext;
Home.propTypes={
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
}
class HomePage extends Component{
  render(){
    return (
      <Container {...this.props} showDrawerIfIsDesktop={false}>
        <Home {...this.props} />
      </Container>
    )
  }
}
export default  withRouter(withMediaQuery('(max-width:480px)')(HomePage));

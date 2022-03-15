import React,{Component} from 'react';
import NotFoundComponent from 'flexbiz-core/notfound.js';
import {withRouter} from 'react-router-dom';
import Container from './Container'
class NotFound extends Component{
  render(){
    return (
      <Container {...this.props} showDrawerIfIsDesktop={true}>
        <NotFoundComponent {...this.props}/>
      </Container>
    )
  }
}
export default  withRouter(NotFound);

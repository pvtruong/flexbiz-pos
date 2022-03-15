import React from 'react';
import PropTypes from 'prop-types';
import {NavLink,withRouter } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ReportIcon from '@material-ui/icons/Assessment';
import VoucherIcon from '@material-ui/icons/PostAdd';
import ListIcon from '@material-ui/icons/PlaylistAdd';
import UserGroupIcon from '@material-ui/icons/PeopleAlt';
import Avatar from '@material-ui/core/Avatar';
import AuthContext from "flexbiz-core/components/auth/Context";
import Container from "flexbiz-core/components/Container";
import {mainTextColor,secondaryColor,iconColor} from '../../../config'
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
export function Icon({item,...others}){
  let dicon = <ArrowForwardIosIcon/>;
  if(item.path.includes("/usergroup"))  dicon =  <UserGroupIcon/>;
  if(item.path.includes("/tinh"))  dicon = <ArrowForwardIosIcon/>;
  if(item.path.includes("/voucher"))  dicon = <VoucherIcon/>;
  if(item.path.includes("/report")) dicon = <ReportIcon/>;
  if(item.path.includes("/list"))  dicon = <ListIcon/>;
  return  <Avatar {...others}>{dicon}</Avatar>
}
Icon.propTypes={
  item: PropTypes.object,
  style: PropTypes.object,
}
class VContainer extends React.Component{
  constructor(props){
    super(props);
    this.height = this.props.mediaQueryMatches?null:"calc(100vh - 65px)";
  }
  componentDidMount(){
  }
  render(){
    return (
      <Container requireLogin
        linkStyle={{color:mainTextColor}}  
        showDrawerIfIsDesktop ={false}
        drawer={()=>{
          return (
              <List>
                <AuthContext.Consumer>
                  {({menu})=>{
                    if(!menu || menu.length===0) return null;
                    const _menu = menu.filter(m=>m.visible!=false);
                    const groups = [...new Set(_menu.map(item=>item.group))]
                    return groups.map(group=>{
                        const items = _menu.filter(item=>item.group===group);
                        return (
                          <li key={`section-${group}`}>
                            <ul style={{padding:0}}>
                              <ListSubheader>{this.context.apis.getLabel(group)}</ListSubheader>
                              {items.map((item,index) => (
                                <ListItem button key={index.toString()} component={NavLink} to={`${item.path}`} activeStyle={{color: secondaryColor}}>
                                  <ListItemIcon>
                                    <Icon item={item} style={{background:iconColor,color:mainTextColor}}/>
                                  </ListItemIcon>
                                  <ListItemText  primary={this.context.apis.getLabel(item.title)} />
                                </ListItem>
                              ))}
                            </ul>
                          </li>
                        )
                      })
                  }}
                </AuthContext.Consumer>
            </List>
        )
      }}
      {...this.props}>
        <div style={{height:this.height}}>
          {this.props.children}
        </div>
      </Container>
    )
  }
}
VContainer.contextType = AuthContext;
VContainer.propTypes={
  children: PropTypes.any,
  match: PropTypes.any,
  showDrawerIfIsDesktop: PropTypes.bool,
  mediaQueryMatches: PropTypes.bool,
}
export default  withRouter(withMediaQuery('(max-width:480px)')(VContainer));

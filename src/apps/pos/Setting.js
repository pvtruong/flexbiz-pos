import React,{Component} from 'react';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
//import {getLabel} from '../../API';
import Container from './Container';
import PropTypes from 'prop-types';
import Frag from "flexbiz-core/components/Frag";
import NumberFormatCustom  from 'flexbiz-core/components/NumberFormatCustom';
import TextField from '@material-ui/core/TextField';
import config  from '../../../config';
class Setting extends Component{
  constructor(props){
    super(props);
    this.state={
        print_service_url:config.print_service_url,
        printPageWidth:config.printPageWidth
    }
  } 
  save(){
    config.print_service_url = this.state.print_service_url;
    config.printPageWidth = this.state.printPageWidth;
    localStorage.setItem('print_service_url', config.print_service_url);
    localStorage.setItem('printPageWidth', config.printPageWidth);
    this.context.alert(this.context.apis.getLabel("Đã lưu thành công"));
  }
  render(){
    let {printPageWidth,print_service_url} = this.state;
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
        <Frag title={this.context.apis.getLabel("Tuỳ chọn")} style={{maxWidth:350}}>
            <TextField
                margin="normal"
                fullWidth
                type="text"
                label={this.context.apis.getLabel("Địa chỉ máy in")}
                value={print_service_url}
                InputLabelProps={{ shrink: true }}
                onChange={(event)=>this.setState({print_service_url:event.target.value})}
            />
            <TextField
                margin="normal"
                fullWidth
                type="text"
                label={this.context.apis.getLabel("Độ rộng mẫu in (px)")}
                value={printPageWidth}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    inputComponent: NumberFormatCustom
                }}
                onChange={(event)=>this.setState({printPageWidth:Number(event.target.value)})}
            />
            <div style={{display:"flex",flexDirection:'column',alignItems:"center",justifyContent:"center",marginTop:10}}>
                <Button variant="contained" color="secondary" onClick={this.save.bind(this)} style={{marginBottom:10}}>
                    {this.context.apis.getLabel("Lưu")}
                </Button>
            </div>
        </Frag>
      </div>
    )
  }
}
Setting.contextType = AuthContext;
Setting.propTypes={
  match: PropTypes.any,
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
}
class SettingPage extends Component{
  render(){
    return (
      <Container requireLogin {...this.props}  showDrawerIfIsDesktop={true}>
        <Setting {...this.props} />
      </Container>
    )
  }
}
export default withRouter(withMediaQuery('(max-width:480px)')(SettingPage));
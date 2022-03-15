import React,{Component} from 'react';
import Paper from '@material-ui/core/Paper';
import {withRouter} from 'react-router-dom';
import Container from './Container'
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AuthContext from "flexbiz-core/components/auth/Context";
import {titleColor,id_app} from '../../../config'
class AppInfo extends React.Component{
  constructor(props){
    super(props);
    this.state={
    }
  }
  async componentDidMount( ) {
    this.context.setProgressStatus(true);
    try{
        const appInfo = await this.context.apis.asyncGetData(this.context.userInfo.token,"app",{_id:id_app});
        const listInfo = await this.context.apis.asyncGetData(this.context.userInfo.token,"listinfo",{code:"app"});
        const {default:FormBase} = await import("flexbiz-core/components/FormBase");
        this.setState({
          FormBase:<FormBase
            handleValueChanged={_data=>{
              for(let key in _data){
                this.state.appInfo[key] = _data[key];
              }
            }} 
            fields={listInfo.fields} data={appInfo}/>,
          appInfo,
          listInfo
        });
        this.context.setProgressStatus(false);
    }catch(e){
        this.context.alert(e.message||JSON.stringify(e));
    }
  }
  async update(){
    if(this.state.appInfo){
        this.context.setProgressStatus(true);
        try{
            await this.context.apis.asyncPostList(this.context.userInfo.token,"app",this.state.appInfo);
            this.context.alert(this.context.apis.getLabel("Đã cập nhật thành công"),null,"black");
        }catch(e){
            this.context.alert(e.message||JSON.stringify(e));
        }
    }
  }
  async backup(){
    this.context.setProgressStatus(true);
    this.context.apis.asyncBackup(this.context.userInfo.token,this.state.appInfo._id,(error)=>{
      if(error) return this.context.alert(this.context.apis.getLabel(error));
      this.context.setProgressStatus(false);
    })
  }
  render(){
    return (
      <Paper style={{padding:10,margin:10}}>
          <Typography gutterBottom variant="title" component='h3' style={{flexGrow:1,color:titleColor}}>
              {this.context.apis.getLabel("Thông tin công ty").toUpperCase()}
          </Typography>
          {this.state.FormBase}
          {!!this.state.FormBase &&
            <div style={{display:"flex",justifyContent:'center',alignItems:"center",marginTop:20}}>
                <Button variant="contained" color="secondary" onClick={this.update.bind(this)}>{this.context.apis.getLabel("Cập nhật")}</Button>
                <Button variant="contained" color="secondary" style={{marginLeft:10}} onClick={this.backup.bind(this)}>{this.context.apis.getLabel("Backup")}</Button>
                <Button variant="contained" color="secondary" component="label" style={{marginLeft:10}}>
                  <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={event=>{
                          const files = event.target.files;
                          if(files.length>0){
                            this.context.setProgressStatus(true);
                            this.context.apis.asyncRestore(this.context.userInfo.token,this.state.appInfo._id,files[0],(error)=>{
                                this.context.setProgressStatus(false);
                                if(error) return this.context.alert(this.context.apis.getLabel(error.message));
                                this.context.alert(this.context.apis.getLabel("Chương trình đã thực hiện xong"),null,"green");
                            })
                          }
                      }}
                  />
                  {this.context.apis.getLabel("Restore")}            
                </Button>
            </div>
          }
      </Paper>
    )
  }
}
AppInfo.contextType = AuthContext;
class AppInfoPage extends Component{
  render(){
    return (
      <Container {...this.props} showDrawerIfIsDesktop={false} requireLogin>
        <AppInfo {...this.props} />
      </Container>
    )
  }
}
export default  withRouter(AppInfoPage);

import React, {Component} from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
//import {getLabel,asyncGetData} from '../../../API'
import DefaultContext from "flexbiz-core/components/auth/Context";
import {formHeaderColor,mainTextColor} from '../../../../config';
import Moment from 'moment';
class Form extends Component{
  constructor(props){
    super(props);
    this.handleValueChanged = this.handleValueChanged.bind(this);
    this.state={
      open:false,
      evoucher_code:""
    }
  }
  open(title,ma_kh,callback){
    this.callback = callback;
    this.ma_kh = ma_kh;
    this.setState({title:title,evoucher_code:"",open:true});
  }
  close(){
    this.setState({open:false});
  }
  async add(){
    if(!this.state.evoucher_code) return this.context.alert(this.context.apis.getLabel("Bạn chưa nhập mã thẻ giảm giá"));
    let condition = {ma:this.state.evoucher_code.toUpperCase()};
    this.context.setProgressStatus(true);
    try{
      let evoucher = await this.context.apis.asyncGetData(this.context.userInfo.token,"evoucher",condition);
      if(!evoucher){
        return this.context.alert(this.context.apis.getLabel("Mã thẻ giảm giá này không có giá trị"));
      }
      if(evoucher.id_ct_used){
        return this.context.alert(this.context.apis.getLabel("Mã thẻ giảm giá này đã được sử dụng"));
      }
      let hieu_luc_tu = Moment(evoucher.hieu_luc_tu).startOf("date").toDate().getTime();
      let hieu_luc_den = Moment(evoucher.hieu_luc_den).endOf("date").toDate().getTime();
      let now = Moment().toDate().getTime();
      if(now<hieu_luc_tu || now>hieu_luc_den){
        return this.context.alert(this.context.apis.getLabel("Mã thẻ giảm giá này đã hết hạn sử dụng"));
      }
      if(evoucher.user){
        if(!this.ma_kh){
          return this.context.alert(this.context.apis.getLabel("Mã thẻ giảm giá này không có giá trị với khách hàng này"));
        }
        let of_user = await this.context.apis.asyncGetData(this.context.userInfo.token,"customer",{ma_kh:this.ma_kh},"of_user");
        if(evoucher.user!=of_user){
          return this.context.alert(this.context.apis.getLabel("Mã thẻ giảm giá này không có giá trị với khách hàng này"));
        }
      }
      this.context.setProgressStatus(false);
      if(this.callback) this.callback(evoucher);
    }catch(e){
      this.context.alert(e.message||"Không thể kết nối với máy chủ")
    }
    this.close();
  }
  handleValueChanged(evoucher_code){
    this.setState({evoucher_code:(evoucher_code||"").toUpperCase()});
  }
  render(){
    if(!this.state.open) return null;
    let {evoucher_code} = this.state;
    return(
      <Dialog
        maxWidth={'sm'}
        fullWidth={true}
        open={this.state.open}
        onClose={this.close.bind(this)}
      >
        <DialogTitle style={{backgroundColor:formHeaderColor,color:mainTextColor}}>
          <div style={{display:"flex",alignItems:"center"}}>
            <div style={{flexGrow:1}}>
              <Typography>{this.state.title}</Typography>
            </div>
            <div style={{display:'flex',flexDirection:"row",alignItems:"center",justifyContent:'flex-end',paddingLeft:10}}>
              <IconButton style={{marginLeft:5}} onClick={()=>this.setState({open:false})}>
                <CloseIcon style={{color:"silver"}}/>
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{padding:0}}>
          <TextField
              margin="normal"
              variant="outlined"
              fullWidth
              type="text"
              label={""}
              autoFocus={true}
              multiline={true}
              value={evoucher_code}
              InputLabelProps={{ shrink: true }}
              onChange={(event)=>this.handleValueChanged(event.target.value)}
          />
          <div style={{display:"flex",justifyContent:"center",padding:10}}>
            <Button variant="contained" onClick={this.add.bind(this)}>{this.context.apis.getLabel("Thêm")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}
Form.contextType = DefaultContext;
export default Form;

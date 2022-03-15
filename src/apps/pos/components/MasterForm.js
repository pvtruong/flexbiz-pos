import React, {PureComponent} from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import NumberFormatCustom  from 'flexbiz-core/components/NumberFormatCustom';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
//import {getLabel} from '../../../API'
import DefaultContext from "flexbiz-core/components/auth/Context";
import {formHeaderColor,mainTextColor} from '../../../../config';
import FormBase from "flexbiz-core/components/FormBase";
class Form extends PureComponent{
  constructor(props){
    super(props);
    this.handleValueChanged = this.handleValueChanged.bind(this);
    this.handleTyLeCkChanged = this.handleTyLeCkChanged.bind(this);
    this.handleTienCkChanged = this.handleTienCkChanged.bind(this);
    this.state={
      load:0,
      open:this.props.open,
      disabled_discount:true,
      data:{},
      kho:null
    }
  }
  open(data,kho,callback){
    this.callback = callback;
    this.setState({data,kho,open:true,disabled_discount:true});
  }
  close(){
    this.setState({open:false});
  }
  save(){
    if(!(this.state.data||{}).ma_ban){
        return this.context.alert(this.context.apis.getLabel("Bạn phải chọn một bàn"));
    }
    if(this.callback){
      this.callback(this.state.data);
    }
    this.setState({open:false,disabled_discount:true});
  }
  handleValueChanged(data){
    let _data = this.state.data;
    for(let key in data){
      _data[key] = data[key]
    }
    this.setState({data:_data,load:this.state.load+1});
  }
  handleTyLeCkChanged(ty_le_ck){
    let {data} = this.state;
    let t_tien = (data.details||[]).map(d=>((d.tien_hang_nt||0)-(d.tien_ck_nt||0))).reduce((a,b)=>a+b,0);
    data.ty_le_ck_hd = ty_le_ck;
    data.tien_ck_hd = Math.round(t_tien * data.ty_le_ck_hd/100,0);
    data.t_ck_nt = data.tien_ck_hd + (data.details||[]).map(d=>d.tien_ck_nt).reduce((a,b)=>a+b,0);
    this.setState({data,load:this.state.load+1});
  }
  handleTienCkChanged(tien_ck_hd){
    console.log("tien ck hd changed",tien_ck_hd)
    let {data} = this.state;
    data.tien_ck_hd = Number(tien_ck_hd);
    data.ty_le_ck_hd =0;
    data.t_ck_nt = data.tien_ck_hd + (data.details||[]).map(d=>d.tien_ck_nt).reduce((a,b)=>a+b,0);
    this.setState({data,load:this.state.load+1});
  }
  editDiscount(){
    let {kho,data} = this.state;
    if(!kho.user_quan_ly){
      return this.context.alert(this.context.apis.getLabel("Chưa khai báo người quản lý cho cửa hàng này"));
    }
    const sign_data ={
      time:new Date(),
      id_app:this.context.config.id_app
    }
    this.context.sign("Nhập mật khẩu để ký xác nhận thay đổi chiết khấu",kho.user_quan_ly,sign_data,(signature)=>{
      data.sign_user = kho.user_quan_ly;
      data.sign_data = sign_data;
      data.signature = signature;
      this.setState({disabled_discount:false})
    })
  }
  render(){
    if(!this.state.open) return null;
    let {data,disabled_discount} = this.state;
    const fields=[
        {
            "type": "String",
            "maxlength": 32,
            "required": true,
            "name": "ma_ban",
            "header": "Bàn",
            "ref_model": "dmban",
            "ref_field": "ma_ban",
            "ref_label": "ten_ban",
            "ref_condition": `{"ma_kho":"${data.ma_kho}"}`,
            "html_component_input": "picker"
        },
        {
            "type": "String",
            "maxlength": 32,
            "required": false,
            "name": "ma_kh",
            "header": "Khách hàng",
            "ref_model": "customer",
            "ref_field": "ma_kh",
            "ref_label": "ten_kh"
        },
        {
          "type": "String",
          "maxlength": 1024,
          "required": false,
          "name": "ong_ba",
          "header": "Người giao dịch",
        },
        {
          "type": "Number",
          "required": true,
          "name": "so_khach",
          "header": "Số khách",
        },
        {
            "type": "String",
            "maxlength": 1024,
            "required": false,
            "name": "dien_giai",
            "header": "Ghi chú",
            "grid_configs":"{lg:12,md:12}",
            "html_component_input": "textarea"
        },
    ]
    return(
      <Dialog
        maxWidth={'sm'}
        fullWidth={true}
        open={this.state.open}
      >
        <DialogTitle style={{backgroundColor:formHeaderColor,color:mainTextColor}}>
          <div style={{display:"flex",alignItems:"center"}}>
            <div style={{flexGrow:1}}>
              <Typography>{this.state.title || this.context.apis.getLabel("Cập nhật phiếu")}</Typography>
            </div>
            <div style={{display:'flex',flexDirection:"row",alignItems:"center",justifyContent:'flex-end',paddingLeft:10}}>
              <IconButton style={{marginLeft:5}} onClick={()=>this.setState({open:false})}>
                <CloseIcon style={{color:"silver"}}/>
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{padding:0}}>
            <Paper  style={{margin:10,padding:10}}>
              <div>
                  <FormBase
                      fields={fields}
                      master={data}
                      data={data}
                      handleValueChanged={this.handleValueChanged.bind(this)}
                  />
              </div>
            </Paper>
            <Paper  style={{margin:10,padding:10}}>
              <Grid container>
                <Grid item>
                  <TextField
                      margin="normal"
                      variant="standard"
                      type="text"
                      id="ty_le_ck_hd"
                      label={this.context.apis.getLabel("Tỷ lệ CK hoá đơn")}
                      value={data.ty_le_ck_hd}
                      disabled={disabled_discount}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        inputComponent: NumberFormatCustom,
                      }}
                      onChange={(event)=>this.handleTyLeCkChanged(Number(event.target.value))}
                  />
                </Grid>
                <Grid item style={{flexGrow:1,paddingLeft:10,paddingRight:10}}>
                  <TextField
                      fullWidth
                      margin="normal"
                      variant="standard"
                      type="text"
                      id="tien_ck_hd"
                      label={this.context.apis.getLabel("Tiền chiết khấu hoá đơn")}
                      value={data.tien_ck_hd}
                      disabled={disabled_discount}
                      InputLabelProps={{
                        shrink: true
                      }}
                      InputProps={{
                        inputComponent: NumberFormatCustom,
                      }}
                      onChange={(event)=>this.handleTienCkChanged(event.target.value)}
                  />
                </Grid>
                {disabled_discount && <Grid item style={{display:"flex",alignItems:"flex-end"}}>
                    <Button variant="contained" onClick={this.editDiscount.bind(this)}>{this.context.apis.getLabel("Sửa")}</Button>
                </Grid>}
              </Grid>
            </Paper>
            
            <div style={{display:"flex",justifyContent:"center",padding:10}}>
              <Button variant="contained" color="secondary" onClick={this.save.bind(this)}>{this.context.apis.getLabel("Lưu")}</Button>
            </div>
            
        </DialogContent>
      </Dialog>
    )
  }
}
Form.contextType = DefaultContext;
Form.propTypes={
  open:PropTypes.bool
}
export default Form;

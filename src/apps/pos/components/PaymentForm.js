import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
//import {getLabel,asyncGet,asyncGetData} from '../../../API'
import DefaultContext from "flexbiz-core/components/auth/Context";
import {formHeaderColor,mainTextColor,mainColor,id_app,server_url} from '../../../../config';
import Picker from 'flexbiz-core/components/Picker';
import Numeral from "numeral";
import NumberFormatCustom  from 'flexbiz-core/components/NumberFormatCustom';
import Frag from "flexbiz-core/components/Frag";
import Evouchers from "./Evouchers";
class Form extends Component{
  constructor(props){
    super(props);
    this.handleValueChanged = this.handleValueChanged.bind(this);
    this.state={
      open:false,
      voucher:{}
    }
    this.currentField = "tien_thu";
  }
  async componentDidMount(){
  }
  async open(voucher,callback,mediaQueryMatches){
    this.callback = callback;
    voucher.tien_thu=0;
    voucher.tien_thu2=0;
    this.calcConNo(voucher);
    this.mediaQueryMatches = mediaQueryMatches;
    voucher.phai_tra =0;
    if(!voucher.pt_thanh_toan){
      try{
        let options = (await this.context.apis.asyncGetData(this.context.userInfo.token,"options",{id_func:"pbl"},"option",true))||{};
        if(options.pt_thanh_toan){
          voucher.pt_thanh_toan = options.pt_thanh_toan;
        }else{
          let ptt = await this.context.apis.asyncGetData(this.context.userInfo.token,"ptthanhtoan",null,"_id",true);
          if(ptt){
            voucher.pt_thanh_toan = ptt;
          }
        }
      }catch(e){
        console.error(e.message);
      }
    }
    this.setState({voucher:voucher,open:true});
  }
  close(){
    this.setState({open:false});
  }
  cancel(){
    this.context.alert(this.context.apis.getLabel("Có chắc chắn huỷ phiếu này không?"),()=>{
        const {voucher} = this.state;
        voucher.trang_thai ="9";
        if(this.callback){
            this.callback(voucher);
        }
        this.setState({open:false});
    })
  }
  payment(){
    const {voucher} = this.state;
    if(!voucher.pt_thanh_toan){
      return this.context.alert(this.context.apis.getLabel("Hãy chọn một phương thức thanh toán"));
    }
    if(voucher.con_no){
        return this.context.alert(this.context.apis.getLabel("Số tiền nhận chưa đủ"));
    }else{
        voucher.trang_thai ="5";
        voucher.cashier = this.context.userInfo.email;
        voucher.payment_time = new Date();
        if(this.callback){
            this.callback(voucher);
        }
        this.setState({open:false});
    }
  }
  calcConNo(voucher){
    voucher.tien_evoucher = (voucher.evouchers||[]).map(e=>{
      let so_tien = e.ty_le?Math.roundBy(voucher.t_tien_nt * e.ty_le/100,0):e.so_tien;
      if(e.so_tien_max && so_tien>e.so_tien_max) so_tien = e.so_tien_max;
      e.so_tien_giam = so_tien;
      return so_tien;
    }).reduce((a,b)=>a+b,0);

    voucher.t_ck_nt = voucher.details.map(d=>d.tien_ck_nt).reduce((a,b)=>a+b,0) + (voucher.tien_ck_hd||0)+ (voucher.tien_evoucher||0);
    voucher.t_tt_nt = voucher.t_tien_nt - voucher.t_ck_nt;

    voucher.con_no = voucher.t_tt_nt-voucher.tien_thu-voucher.tien_thu2-(voucher.tien_paymentByPoints||0);

    if(voucher.con_no<0){
        voucher.phai_tra = Math.abs(voucher.con_no);
        voucher.con_no =0;
    }else{
        voucher.phai_tra = 0;
    }
  }
  handleEvouchersChange(evouchers){
    const {voucher} = this.state;
    voucher.evouchers = [...evouchers];
    this.calcConNo(voucher);
    this.setState({voucher});
    if(this.props.onEvouchersChange){
      this.props.onEvouchersChange(evouchers);
    }
  }
  handleValueChanged(data){
    const {voucher} = this.state;
    for(let key in data){
        voucher[key] = data[key];
    }
    if(voucher.tien_thu===0) voucher.tien_thu2===0;
    //tinh tien con no va phai tra
    this.calcConNo(voucher);
    this.setState({voucher});
  }
  add(number){
    const {voucher} = this.state;
    if(this.currentField){
      let value = voucher[this.currentField] + number;
      let valueChange = {[this.currentField]:value};
      this.handleValueChanged(valueChange)
    }
  }
  render(){
    if(!this.state.open) return null;
    const {voucher} = this.state;
    return(
      <Dialog
        maxWidth={'md'}
        open={this.state.open}
        onClose={this.close.bind(this)}
      >
        <DialogTitle style={{backgroundColor:formHeaderColor,color:mainTextColor}}>
          <div style={{display:"flex",alignItems:"center"}}>
            <div style={{flexGrow:1}}>
              <Typography>{this.context.apis.getLabel("Thanh toán")}</Typography>
            </div>
            <div style={{display:'flex',flexDirection:"row",alignItems:"center",justifyContent:'flex-end',paddingLeft:10}}>
              <Button variant="contained" color="secondary" onClick={this.payment.bind(this)}>
                {this.context.apis.getLabel("Thanh toán")}
              </Button>
              {/*<Button variant="contained" color="secondary" onClick={this.cancel.bind(this)} style={{marginLeft:5}}>
                {this.context.apis.getLabel("Huỷ phiếu")}
              </Button>*/}
              <Button variant="contained" color="secondary"  style={{marginLeft:5}} onClick={()=>this.setState({open:false})}>
                <CloseIcon/>
              </Button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{padding:10}}>
          <Grid container spacing={2}>
            <Grid item md={8} lg={8}>
              <TextField
                  margin="normal"
                  fullWidth
                  type="text"
                  label={this.context.apis.getLabel("Tổng tiền phải thanh toán")}
                  value={voucher.t_tt_nt}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                      readOnly:true,
                      inputComponent: NumberFormatCustom,
                      style:{fontSize:18,color:mainColor}
                  }}
              />
              <FormControl margin="normal" fullWidth required={true}>
                  <InputLabel shrink={true}>{this.context.apis.getLabel("Phương thức thanh toán")}</InputLabel>
                  <Picker
                      fullWidth
                      required={true}
                      value={voucher.pt_thanh_toan}
                      valueField={"_id"}
                      labelField={"ten"}
                      items={async (query)=>{
                          let token = this.context.userInfo.token;
                          let url = `${server_url}/api`;
                          let model = "ptthanhtoan";
                          url = `${url}/${id_app}/${model}?access_token=${token}`
                          if(query) url = `${url}&q=${JSON.stringify(query)}&fields=ten`;
                          return JSON.parse(await this.context.apis.asyncGet(url,null,{cache:true}));
                      }}
                      onValueChanged={(value)=>{
                          this.handleValueChanged({pt_thanh_toan:value});
                      }}
                  />
              </FormControl>
              <TextField
                  margin="normal"
                  fullWidth
                  type="text"
                  label={this.context.apis.getLabel("Số tiền nhận")}
                  value={voucher.tien_thu}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                      inputComponent: NumberFormatCustom,
                      style:{fontSize:24}
                  }}
                  onFocus={()=>{
                    this.currentField = "tien_thu"
                  }}
                  onChange={(event)=>this.handleValueChanged({tien_thu:Number(event.target.value)})}
              />
              {((voucher.con_no>0  && voucher.tien_thu>0) || voucher.tien_thu2>0) &&
                  <>
                      <FormControl margin="normal" fullWidth required={true}>
                          <InputLabel shrink={true}>{this.context.apis.getLabel("Phương thức thanh toán khác")}</InputLabel>
                          <Picker
                              fullWidth
                              required={true}
                              value={voucher.pt_thanh_toan2}
                              valueField={"_id"}
                              labelField={"ten"}
                              items={async (query)=>{
                                  let token = this.context.userInfo.token;
                                  let url = `${server_url}/api`;
                                  let model = "ptthanhtoan";
                                  url = `${url}/${id_app}/${model}?access_token=${token}`
                                  if(query) url = `${url}&q=${JSON.stringify(query)}&fields=ten`;
                                  return JSON.parse(await this.context.apis.asyncGet(url,null,{cache:true}));
                              }}
                              onValueChanged={(value)=>{
                                  this.handleValueChanged({pt_thanh_toan2:value});
                              }}
                          />
                      </FormControl>
                      {!!voucher.pt_thanh_toan2 && <TextField
                          margin="normal"
                          fullWidth
                          type="text"
                          label={this.context.apis.getLabel("Số tiền nhận khác")}
                          value={voucher.tien_thu2}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                              inputComponent: NumberFormatCustom,
                              style:{fontSize:32}
                          }}
                          onFocus={()=>{
                            this.currentField = "tien_thu2"
                          }}
                          onChange={(event)=>this.handleValueChanged({tien_thu2:Number(event.target.value)})}
                      />}
                  </>
              }
              {voucher.con_no>0 && voucher.tien_thu>0 &&
                  <TextField
                      margin="normal"
                      fullWidth
                      type="text"
                      label={this.context.apis.getLabel("Còn thiếu")}
                      value={voucher.con_no}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                          readOnly:true,
                          inputComponent: NumberFormatCustom,
                          style:{fontSize:24}
                      }}
                  />
              }
              {voucher.phai_tra>0 &&
                  <TextField
                      margin="normal"
                      fullWidth
                      type="text"
                      label={this.context.apis.getLabel("Phải trả lại")}
                      value={voucher.phai_tra}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                          readOnly:true,
                          inputComponent: NumberFormatCustom,
                          style:{fontSize:24}
                      }}
                  />
              }
            </Grid>
            <Grid item md={4} lg={4}>
              {!this.mediaQueryMatches &&
                <Frag title={this.context.apis.getLabel("Chọn mệnh giá")}>
                  <Grid container spacing={2} justify="space-between">
                    {[5000,10000,20000,50000,100000,200000,500000,1000000,2000000].map(item=>{
                      return (
                        <Grid item md={4} lg={4}  key={item.toString()}>
                          <Button fullWidth onClick={()=>this.add(item)} variant="contained">{Numeral(item).format()}</Button>
                        </Grid>
                      )
                    })}
                    <Grid item md={6} lg={6}>
                      <Button fullWidth color="secondary" onClick={()=>this.add(voucher.t_tt_nt)} variant="contained">{Numeral(voucher.t_tt_nt).format()}</Button>
                    </Grid>
                    {!!voucher.con_no && voucher.con_no!==voucher.t_tt_nt  &&
                      <Grid item md={6} lg={6}>
                        <Button fullWidth  color="secondary"  onClick={()=>this.add(voucher.con_no)} variant="contained">{Numeral(voucher.con_no).format()}</Button>
                      </Grid>
                    }
                  </Grid>
                </Frag>
              }
              <Frag title={this.context.apis.getLabel("Phiếu giảm giá")}>
                <Evouchers data={this.state.voucher.evouchers} ma_kh={this.state.voucher.ma_kh} onDataChange={this.handleEvouchersChange.bind(this)}/>
              </Frag>
            </Grid>
          </Grid>
            
        </DialogContent>
      </Dialog>
    )
  }
}
Form.contextType = DefaultContext;
Form.propTypes={
  onEvouchersChange:PropTypes.func,
}
export default Form;

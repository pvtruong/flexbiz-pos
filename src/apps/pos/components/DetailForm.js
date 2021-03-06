import React, {PureComponent} from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ListIcon from '@material-ui/icons/List';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import DefaultContext from "flexbiz-core/components/auth/Context";
import ObjectPicker from "flexbiz-core/components/ObjectPicker";
import {formHeaderColor,mainTextColor} from '../../../../config';
import NumberFormatCustom  from 'flexbiz-core/components/NumberFormatCustom';
class Form extends PureComponent{
  constructor(props){
    super(props);
    this.handleValueChanged = this.handleValueChanged.bind(this);
    this.handleGhiChuChanged = this.handleGhiChuChanged.bind(this);
    this.handleTyLeCkChanged = this.handleTyLeCkChanged.bind(this);
    this.handleTienCkChanged = this.handleTienCkChanged.bind(this);
    this.pickNote = this.pickNote.bind(this);
    this.state={
      open:this.props.open,
      disabled_discount:true,
      load:0,
      detail:null
    }
  }
  open(title,detail,callback,kho={}){
    this.callback = callback;
    this.setState(
      {
        title:title,
        open:true,
        disabled_discount:true,
        detail:{...detail},
        kho:kho
      }
    );
  }
  close(){
    this.setState({open:false});
  }
  save(){
    if(this.callback){
      let {detail} = this.state;
      this.callback(detail);
    }
    this.setState({open:false});
  }
  delete(){
    this.context.alert(this.context.apis.getLabel("B???n c?? ch???c ch???n xo?? s???n ph???m n??y kh??ng?"),()=>{
      if(this.callback){
        this.callback(0);
      }
      this.setState({open:false});
    })
  }
  handleValueChanged(sl,plus=true){
    let {detail} = this.state;
    let sl_xuat = detail.sl_xuat;
    if(plus){
      sl_xuat = sl_xuat + sl;
    }else{
      sl_xuat = sl;
    }
    if(sl_xuat<=0) return;
    detail.sl_xuat = sl_xuat;
    if(!this.state.kho.theo_doi_sl_ht){
      detail.sl_order = sl_xuat;
      detail.sl_gui_bep = 0;
      detail.sl_gui_bartender = 0;
    }else{
      if(detail.sp_yeu_cau_che_bien){
        if(sl_xuat>detail.sl_order){
          this.context.toast(this.context.apis.getLabel("S??? l?????ng ho??n th??nh ???? nhi???u h??n s??? l?????ng ?????t"));
        }
        detail.sl_gui_bartender = 0;
        detail.sl_gui_bep = Math.max(sl_xuat,detail.sl_gui_bep);
      }else{
        if(detail.sp_yeu_cau_pha_che){
          if(sl_xuat>detail.sl_order){
            this.context.toast(this.context.apis.getLabel("S??? l?????ng ho??n th??nh ???? nhi???u h??n s??? l?????ng ?????t"));
          }
          detail.sl_gui_bep = 0;
          detail.sl_gui_bartender = Math.max(sl_xuat,detail.sl_gui_bartender);
        }else{
          detail.sl_gui_bartender = 0;
          detail.sl_gui_bep = 0;
          detail.sl_order = sl_xuat;
        }
      }
    }
    detail.tien_hang_nt = detail.sl_xuat * detail.gia_ban_nt;
    if(detail.ty_le_ck) detail.tien_ck_nt = Math.round(detail.tien_hang_nt * detail.ty_le_ck/100,0);

    detail.tien_nt = detail.tien_hang_nt - (detail.tien_ck_nt||0);

    this.setState({detail,load:this.state.load+1});
  }

  handleOrderChanged(sl,plus=true){
    let {detail} = this.state;
    let sl_order = detail.sl_order||0;
    if(plus){
      sl_order = sl_order + sl;
    }else{
      sl_order = sl;
    }
    if(sl_order<(detail.sl_ht||0)) return;
    detail.sl_order = sl_order;
    this.setState({detail,load:this.state.load+1});
  }

  handleGhiChuChanged(ghi_chu,add = false){
    let {detail} = this.state;
    if(add && detail.ghi_chu){
      if((", "+ detail.ghi_chu).toUpperCase().indexOf(", " + ghi_chu.toUpperCase())<0){
        detail.ghi_chu =`${detail.ghi_chu}, ${ghi_chu}`
      }
    }else{
      detail.ghi_chu = ghi_chu;
    }
    this.setState({detail,load:this.state.load+1});
  }
  handleTyLeCkChanged(ty_le_ck){
    let {detail} = this.state;
    detail.ty_le_ck = ty_le_ck;
    detail.tien_ck_nt = Math.round(detail.tien_hang_nt * detail.ty_le_ck/100,0);
    this.setState({detail,load:this.state.load+1});
  }
  handleTienCkChanged(tien_ck_nt){
    let {detail} = this.state;
    detail.tien_ck_nt = tien_ck_nt;
    detail.ty_le_ck =0;
    this.setState({detail,load:this.state.load+1});
  }
  pickNote(){
    let condition={id_link:"PBL"}
    this.refObjectPicker.open("note",this.context.apis.getLabel("Ch???n m???t ghi ch??"),async (selected)=>{
      this.handleGhiChuChanged(selected.content,true);
    },condition);
  }
  editDiscount(){
    let {kho,detail} = this.state;
    if(!kho.user_quan_ly){
      return this.context.alert(this.context.apis.getLabel("Ch??a khai b??o ng?????i qu???n l?? cho c???a h??ng n??y"));
    }
    const data ={
      ma_vt:detail.ma_vt,
      time:new Date(),
      id_app:this.context.config.id_app
    }
    this.context.sign("Nh???p m???t kh???u ????? k?? x??c nh???n thay ?????i chi???t kh???u",kho.user_quan_ly,data,(signature)=>{
      detail.sign_user = kho.user_quan_ly;
      detail.sign_data = data;
      detail.signature = signature;
      this.setState({disabled_discount:false})
    })
  }
  render(){
    if(!this.state.open || !this.state.detail) return null;
    let {detail,disabled_discount} = this.state;
    let theo_doi_ht = (!!this.state.kho && this.state.kho.theo_doi_sl_ht && (detail.sp_yeu_cau_che_bien || detail.sp_yeu_cau_pha_che))
    return(
      <Dialog
        maxWidth={theo_doi_ht?'md':"sm"}
        fullWidth={true}
        open={this.state.open}
      >
        <DialogTitle style={{backgroundColor:formHeaderColor,color:mainTextColor}}>
          <div style={{display:"flex",alignItems:"center"}}>
            <div style={{flexGrow:1}}>
              <Typography>{this.state.title || this.context.apis.getLabel("Chi ti???t")}</Typography>
            </div>
            <div style={{display:'flex',flexDirection:"row",alignItems:"center",justifyContent:'flex-end',paddingLeft:10}}>
              <IconButton style={{marginLeft:5}} onClick={()=>this.setState({open:false})}>
                <CloseIcon style={{color:"silver"}}/>
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{padding:0}}>
          <div style={{margin:10}}>
            <Grid container spacing={1}  style={{overflow:"hidden"}}>
              {theo_doi_ht && 
                <Grid item md={6} lg={6}>
                  <Card style={{height:"100%"}}>
                    <CardContent  style={{height:"100%"}}>
                      <InputLabel shrink={true}>{this.context.apis.getLabel("S??? l?????ng ?????t")}</InputLabel>
                      <Grid container alignItems="center">
                        <Grid item xs={4} sm={4} md={4} lg={4}  style={{display:"flex",padding:5,justifyContent:"flex-end"}}>
                            <Tooltip title={this.context.apis.getLabel("Gi???m 1")}>
                                <IconButton  size="small"   onClick={()=>this.handleOrderChanged(-1)} disabled={detail.sl_order<=1}>
                                    <RemoveIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item  xs={4} sm={4} md={4} lg={4} style={{padding:5}}>
                            <TextField
                                margin="dense"
                                variant="outlined"
                                fullWidth
                                type="text"
                                label={""}
                                value={detail.sl_order}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: 1,
                                    style:{ textAlign: 'center' },
                                    inputComponent: NumberFormatCustom
                                }}
                                onChange={(event)=>this.handleOrderChanged(Number(event.target.value),false)}
                            />
                            {detail.sp_yeu_cau_che_bien && 
                            <Typography variant="caption" component="div" style={{textAlign:"center"}}>
                              {`${this.context.apis.getLabel("???? g???i b???p")}: ${detail.sl_gui_bep}`}
                            </Typography>}
                            {detail.sp_yeu_cau_pha_che && 
                            <Typography variant="caption" component="div" style={{textAlign:"center"}}>
                              {`${this.context.apis.getLabel("???? g???i bartender")}: ${detail.sl_gui_bartender}`}
                            </Typography>}
                        </Grid>
                        <Grid item  xs={2} sm={2} md={2} lg={2} style={{display:"flex",padding:5}}>
                            <Tooltip title={this.context.apis.getLabel("T??ng 1")}>
                                <IconButton  size="small"  onClick={()=>this.handleOrderChanged(1)} style={{marginRight:10}}>
                                    <AddIcon/>
                                </IconButton>
                            </Tooltip>
                        </Grid>
                      </Grid>
                    </CardContent>
                    
                  </Card>
                </Grid>
              }
                <Grid item md={theo_doi_ht?6:12} lg={theo_doi_ht?6:12}>
                  <Card style={{height:"100%"}}>
                    <CardContent  style={{height:"100%"}}>
                      <InputLabel shrink={true}>{this.context.apis.getLabel(theo_doi_ht?"S??? l?????ng ho??n th??nh":"S??? l?????ng")}</InputLabel>
                      <Grid container alignItems="center">
                        <Grid item xs={4} sm={4} md={4} lg={4}  style={{display:"flex",padding:5,justifyContent:"flex-end"}}>
                            <Tooltip title={this.context.apis.getLabel("Gi???m 1")}>
                                <IconButton size="small"  onClick={()=>this.handleValueChanged(-1)} disabled={detail.sl_xuat<=0}>
                                    <RemoveIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item  xs={4} sm={4} md={4} lg={4} style={{display:"flex",padding:5}}>
                            <TextField
                                margin="dense"
                                variant="outlined"
                                fullWidth
                                type="text"
                                label={""}
                                value={detail.sl_xuat}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: 1,
                                    style:{ textAlign: 'center' },
                                    inputComponent: NumberFormatCustom
                                }}
                                onChange={(event)=>this.handleValueChanged(Number(event.target.value),false)}
                            />
                        </Grid>
                        <Grid item  xs={2} sm={2} md={2} lg={2} style={{display:"flex",padding:5}}>
                            <Tooltip title={this.context.apis.getLabel("T??ng 1")}>
                                <IconButton  size="small"  onClick={()=>this.handleValueChanged(1)} style={{marginRight:10}}>
                                    <AddIcon/>
                                </IconButton>
                            </Tooltip>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
          </div>
          <Card  style={{margin:10,padding:10}}>
            <Grid container>
              <Grid item>
                <TextField
                    margin="normal"
                    variant="standard"
                    type="text"
                    id="ty_le_ck_hd"
                    label={this.context.apis.getLabel("T??? l??? chi???t kh???u")}
                    value={detail.ty_le_ck}
                    disabled={disabled_discount}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      inputComponent: NumberFormatCustom,
                      min: 0
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
                    label={this.context.apis.getLabel("Ti???n chi???t kh???u")}
                    value={detail.tien_ck_nt}
                    disabled={disabled_discount}
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      inputComponent: NumberFormatCustom,
                      min: 0
                    }}
                    onChange={(event)=>this.handleTienCkChanged(Number(event.target.value))}
                />
              </Grid>
              {disabled_discount && <Grid item style={{display:"flex",alignItems:"flex-end"}}>
                  <Button variant="outlined" onClick={this.editDiscount.bind(this)}>{this.context.apis.getLabel("S???a")}</Button>
              </Grid>}
            </Grid>
          </Card>
          
          <Card  style={{margin:10,padding:10}}>
            <div style={{display:"flex",alignItems:"flex-end"}}>
              <TextField
                  style={{flexGrow:1}}
                  margin="normal"
                  variant="standard"
                  type="text"
                  id="ghi_chu"
                  multiline
                  label={this.context.apis.getLabel("Ghi ch??")}
                  value={detail.ghi_chu}
                  InputLabelProps={{ shrink: true }}
                  onChange={(event)=>this.handleGhiChuChanged(event.target.value)}
              />
              <Button variant="outlined" style={{marginLeft:10}} onClick={()=>this.pickNote()}><ListIcon/></Button>
            </div>
          </Card>

          <div style={{display:"flex",justifyContent:"space-between",padding:10}}>
            <div>
              <Button variant="contained" color="secondary" onClick={this.save.bind(this)}>{this.context.apis.getLabel("L??u")}</Button>
              <Button variant="contained" onClick={()=>this.setState({open:false})} style={{marginLeft:10}}>{this.context.apis.getLabel("????ng")}</Button>
            </div>
            <Button variant="contained" onClick={this.delete.bind(this)} style={{marginLeft:10,backgroundColor:"red",color:"white"}}>{this.context.apis.getLabel("Xo??")}</Button>
          </div>
          <ObjectPicker ref={ref=>this.refObjectPicker= ref} formSize="sm" fullWidth={true} readOnly={false} hideItemActions={true} hideTableHeader={true} hideHeader={true}/>
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

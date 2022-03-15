import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import AuthContext from "flexbiz-core/components/auth/Context";
//import {getLabel} from '../../../API';
import PropTypes from 'prop-types';
import Numeral from 'numeral';
import {isEqual as equal} from 'lodash'
import CountTime from "./CountTime";
import _ from "lodash";
class Bill extends React.PureComponent{
  constructor(props){
    super(props);
    this.state={
       voucher:this.props.voucher,
       load:0
    }
    this.style = {backgroundColor:"white",display:"flex",flexDirection:"column",color:"black"};
    if(this.props.style){
        this.style = {...this.style,...this.props.style}
    }
  }
  async componentDidMount() {
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.voucher,this.props.voucher)){
        this.setState({voucher:this.props.voucher,load:this.state.load+1});
    }
  }
  add(p,sl=1){
    let voucher = this.state.voucher;
    let details = voucher.details;
    let item;
    if(this.props.kho && this.props.kho.theo_doi_sl_ht){
      item = details.find(d=>d.ma_vt===p.ma_vt && d.line===p.line);
    }else{
      item = details.find(d=>d.ma_vt===p.ma_vt);
    }
    if(!item){
      item = {...p,sl_xuat:0};
      item.gia_ban_nt = item.gia_ban_le||0;
      item.order_time = new Date();
      item.sl_ht = 0;
      item.sl_gui_bep =0;
      item.sl_gui_bartender =0;
      item.sl_order = 0;
      item.line = new Date().getTime();
      details.push(item);
    }
    item.sl_order = (item.sl_order||0);
    item.sl_order += sl;
    //fix old voucher
    item.sl_gui_bartender =item.sl_gui_bartender || 0;
    item.sl_gui_bep =item.sl_gui_bep || 0;
    //neu khong theo doi sl ht thi sl_xuat luon bang sl_order
    if(!this.props.kho || !this.props.kho.theo_doi_sl_ht || (!item.sp_yeu_cau_pha_che && !item.sp_yeu_cau_che_bien)){
      item.sl_xuat = item.sl_order;
    }
    //tinh chiet khau
    item.ty_le_ck = item.ty_le_ck||0;
    item.tien_ck_nt = item.tien_ck = item.tien_ck_nt||0;
    //
    if(item.sl_xuat>=item.sl_order){
      if(!item.finish_time || sl) item.finish_time = new Date()
    }else{
      item.finish_time = null
    }
    //
    if(!item.sp_yeu_cau_che_bien && !item.sp_yeu_cau_pha_che){
      item.finish_time = item.order_time;
    }

    if(item.sl_order>0){
      item.tien_hang_nt = item.sl_xuat * item.gia_ban_nt;
      if(item.ty_le_ck){
        item.tien_ck_nt = Math.round(item.tien_hang_nt*item.ty_le_ck/100);
      }
      item.tien_nt = item.tien_hang_nt - item.tien_ck_nt;
    }else{
      if(this.props.kho && this.props.kho.theo_doi_sl_ht){
        details = details.filter(vt=>!(vt.ma_vt===item.ma_vt && vt.line===item.line));
      }else{
        details = details.filter(vt=>vt.ma_vt!==p.ma_vt);
      }  
    }
    voucher.details = details;
    voucher.t_tien_nt = details.map(d=>d.tien_hang_nt).reduce((a,b)=>a+b,0);
    voucher.t_ck_nt = details.map(d=>d.tien_ck_nt).reduce((a,b)=>a+b,0) + (voucher.tien_ck_hd||0)+ (voucher.tien_evoucher||0);
    voucher.t_tt_nt = voucher.t_tien_nt - voucher.t_ck_nt;
    this.setState({voucher,load:this.state.load+1},()=>{
        if(this.props.onBillChange){
          this.props.onBillChange(details);
        }
    });
  }
  setItem(p,sl_order){
    return this.add(p,sl_order - (p.sl_order||0));
  }
  async updateTable(){
    let voucher = this.state.voucher;
    if(!voucher) return;
    await new Promise((resolve)=>{
        (async ()=>{
          if(!this.refMasterForm){
            const {default:MasterForm} = await import("./MasterForm.js")
            this.setState({
                MasterForm:<MasterForm  ref={ref=>this.refMasterForm=ref}/>,
                load:this.state.load+1
            },()=>{
              resolve()
            })
          }else{
            resolve()
          }
        })();
      })
      const _voucher = _.cloneDeep(voucher);
      this.refMasterForm.open(_voucher,this.props.kho,async (data)=>{
        if(voucher.ma_ban && data.ma_ban!==voucher.ma_ban){
          let _ban = await this.context.apis.asyncGetData(this.context.userInfo.token,"dmban",{ma_kho:data.ma_kho,ma_ban:data.ma_ban});
          if(_ban && _ban.trang_thai!=="0"){
            this.context.alert(this.context.apis.getLabel('Không thể đổi bàn do bàn "%s" đang có khách.').replace("%s",_ban.ten_ban));
            return;
          }
        }
        voucher = {...voucher,...data};
        voucher.t_ck_nt = voucher.details.map(d=>d.tien_ck_nt).reduce((a,b)=>a+b,0) + (voucher.tien_ck_hd||0)+ (voucher.tien_evoucher||0);
        voucher.t_tt_nt = voucher.t_tien_nt - voucher.t_ck_nt;

        this.setState({voucher,load:this.state.load+1},()=>{
          if(this.props.onBillChange){
              this.props.onBillChange(voucher.details,voucher)
          }
        });
      });
  }
  async handleDetailClick(detail){
    await new Promise((resolve)=>{
        (async ()=>{
          if(!this.refDetailForm){
            const {default:DetailForm} = await import("./DetailForm")
            this.setState({
                DetailForm:<DetailForm  ref={ref=>this.refDetailForm=ref}/>,
                load:this.state.load+1
            },()=>{
              resolve()
            })
          }else{
            resolve()
          }
        })();
      })
      this.refDetailForm.open(detail.ten_vt,detail,(rs)=>{
        for(let key in rs){
          detail[key] = rs[key];
        }
        this.setItem(detail,rs.sl_order)
      },this.props.kho);
  }

  render(){
    let details = this.state.voucher.details;
    return (
        <Paper style={this.style}>
            <Button fullWidth variant="contained" style={{borderRadius:0}} color="primary" onClick={this.updateTable.bind(this)}>
                <div style={{width:"100%"}}>
                  <Grid container>
                      <Grid item xs={4}>
                          <Typography noWrap component="div" style={{textAlign:"left"}}>{this.context.apis.getLabel("Bàn:")}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                          <Typography noWrap component="div" style={{textAlign:"right"}}>{this.state.voucher.ten_ban||this.state.voucher.ma_ban}</Typography>
                      </Grid>
                  </Grid>
                  <Grid container>
                      <Grid item xs={4}>
                          <Typography noWrap component="div" style={{textAlign:"left"}}>{this.context.apis.getLabel("Khách hàng:")}</Typography>
                      </Grid>
                      <Grid item xs={8}>
                          <Typography noWrap component="div" style={{textAlign:"right"}}>{this.state.voucher.ong_ba||this.state.voucher.ten_kh||"--"}</Typography>
                      </Grid>
                  </Grid>
                </div>
            </Button>
            <TableContainer style={{flexGrow:1,height:(this.props.mediaQueryMatches?"100%":100)}}>
                <Table stickyHeader  size="small">
                    <TableHead>
                      <TableRow>
                        {!!this.props.kho && !!this.props.kho.theo_doi_sl_ht &&
                        <TableCell  padding="checkbox">
                            <Typography variant="body2" style={{textAlign:"center"}}>{this.context.apis.getLabel("TG")}</Typography>
                        </TableCell>
                        }
                        <TableCell  padding="checkbox">
                            <Typography variant="body2">{this.context.apis.getLabel("SL")}</Typography>
                        </TableCell>
                        <TableCell  padding="checkbox">
                            <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{this.context.apis.getLabel("Đơn giá")}</Typography>
                        </TableCell>
                        <TableCell  padding="checkbox">
                            <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{this.context.apis.getLabel("CK")}</Typography>
                        </TableCell>
                        <TableCell  padding="checkbox">
                            <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{this.context.apis.getLabel("TT")}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    {details.map(detail=>{
                      let color = (detail.sl_order===detail.sl_xuat?"green":"red");
                      let finish_time = detail.finish_time?new Date(detail.finish_time):null;
                      let order_time =detail.order_time?new Date(detail.order_time):null;
                      return (
                        <TableBody  tabIndex={-1} key={detail.ma_vt} style={{cursor:"pointer"}} onClick={()=>this.handleDetailClick(detail)}>
                            <TableRow>
                                <TableCell  padding="checkbox" colSpan={4}  style={{borderBottom:"none"}}>
                                    <Typography variant="body2" style={{fontWeight:405}}>{detail.ten_vt} {detail.ty_le_ck?`(-${detail.ty_le_ck}%)`:''}</Typography>
                                    {!!detail.ghi_chu && <Typography variant="caption" component="div" style={{fontStyle:"italic",color:this.context.config.secondaryColor}}>{detail.ghi_chu}</Typography>}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {!!this.props.kho && !!this.props.kho.theo_doi_sl_ht &&
                                <TableCell  padding="checkbox">
                                    <Typography variant="body2" style={{backgroundColor:color,color:"white",padding:2,margin:2,borderRadius:5,textAlign:"center"}}  noWrap>
                                      <CountTime startTime={order_time} finishTime={finish_time}/>
                                    </Typography>
                                </TableCell>}
                                <TableCell  padding="checkbox">
                                    {!!this.props.kho && !!this.props.kho.theo_doi_sl_ht && <Typography variant="body2"  noWrap>{Numeral(detail.sl_xuat).format()}/{Numeral(detail.sl_order).format()}</Typography>}
                                    {(!this.props.kho || !this.props.kho.theo_doi_sl_ht) && <Typography variant="body2"  noWrap>{Numeral(detail.sl_xuat).format()}</Typography>}
                                </TableCell>
                                <TableCell  padding="checkbox">
                                    <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{!detail.gia_ban_nt?"--":(Numeral(detail.gia_ban_nt/1000).format() + "k")}</Typography>
                                </TableCell>
                                <TableCell  padding="checkbox">
                                    <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{!detail.tien_ck_nt?"--":(Numeral(detail.tien_ck_nt/1000).format() + "k")}</Typography>
                                </TableCell>

                                <TableCell  padding="checkbox">
                                    <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{!(detail.tien_hang_nt-detail.tien_ck_nt)?"--":(Numeral((detail.tien_hang_nt-detail.tien_ck_nt)/1000).format() + "k")}</Typography>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                      )
                    })}
                </Table>
            </TableContainer>
            <div style={{borderTop:"1px solid silver",padding:5,backgroundColor:"#FAFAFA"}}>
                <Grid container>
                    <Grid item xs={4}>
                        {this.context.apis.getLabel("Tiền hàng:")}
                    </Grid>
                    <Grid item xs={8}>
                        <Typography noWrap component="div" style={{textAlign:"right"}}>{!this.state.voucher.t_tien_nt?"--":Numeral(this.state.voucher.t_tien_nt).format()}</Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={4}>
                        {this.context.apis.getLabel("Chiết khấu SP:")}
                    </Grid>
                    <Grid item xs={8}>
                        <Typography noWrap component="div" style={{textAlign:"right"}}>{!(this.state.voucher.t_ck_nt-(this.state.voucher.tien_ck_hd||0))?"--":Numeral(this.state.voucher.t_ck_nt-(this.state.voucher.tien_ck_hd||0)).format()}</Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={4}>
                        {this.context.apis.getLabel("Chiết khấu HĐ:")}
                    </Grid>
                    <Grid item xs={8}>
                        <Typography noWrap component="div" style={{textAlign:"right"}}>{!this.state.voucher.tien_ck_hd? "--":Numeral(this.state.voucher.tien_ck_hd||0).format()}</Typography>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={4}>
                        {this.context.apis.getLabel("Thanh toán:")}
                    </Grid>
                    <Grid item xs={8}>
                        <Typography noWrap component="div" style={{textAlign:"right",fontWeight:500}}>{!this.state.voucher.t_tt_nt?"--":Numeral(this.state.voucher.t_tt_nt).format()}</Typography>
                    </Grid>
                </Grid>
            </div>
            {this.state.DetailForm}
            {this.state.MasterForm}
        </Paper>
      )
  }
}
Bill.contextType = AuthContext;
Bill.propTypes={
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
  onProductClick:PropTypes.func,
  style:PropTypes.any,
  kho:PropTypes.object.isRequired,
  voucher:PropTypes.object.isRequired,
  onBillChange:PropTypes.func
}
export default Bill;
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import AuthContext from "flexbiz-core/components/auth/Context";
import {printPageWidth,server_url_report,id_app} from '../../../config'
//import {getLabel,asyncGetData} from '../../API'
import PropTypes from 'prop-types';
import Numeral from 'numeral';
import Moment from "moment";
class Print extends React.Component{
  constructor(props){
    super(props);
    this.state={}
  }
  async componentDidMount() {
    this.loadVoucher();
  }
  async loadVoucher(){
    let token = this.props.match.params.token || this.props.token || localStorage.getItem("token");
    let id = this.props.match.params.id || this.props._id;
    let _id_app = this.props.match.params.id_app || id_app;
    if(!id || !token || !_id_app){
        console.log("Miss  id,id_app or token parameter")
        return;
    }
    try{
        let voucher = await this.context.apis.asyncGetData(token,"pbl",{_id:id,id_app:_id_app});
        let appInfo = (await this.context.apis.asyncGetData(token,"app",{_id:voucher.id_app}))||{};
        let kho = (await this.context.apis.asyncGetData(token,"dmkho",{id_app:voucher.id_app,ma_kho:voucher.ma_kho}))||{};
        this.setState({voucher,appInfo,kho});
    }catch(e){
        console.error(e.message);
    }
  }
  render(){
    if(!this.state.voucher) return null;
    let details = this.state.voucher.details;
    let {appInfo,kho} = this.state;
    let url_content = btoa(window.location.href.split("#")[0] + "#/payment/" + this.state.voucher._id);
    let qrcode_data = `${server_url_report}/qrcode?data=${url_content}`;
    return (
        <div style={{display:"flex",justifyContent:'center'}} id="content-print">
            <div style={{width:printPageWidth?printPageWidth:undefined,padding:5}}>
                <div style={{borderBottom:"1px solid silver"}}>
                    <Grid container justify="space-between">
                        <Grid item>
                            <Typography noWrap variant="caption" component="h5" style={{textAlign:"left"}}>{appInfo.name}</Typography>
                            <Typography noWrap variant="caption" component="h5" style={{textAlign:"left"}}>{kho.ten_kho}</Typography>
                            <Typography noWrap variant="caption" component="h5" style={{textAlign:"left"}}>{kho.dia_chi}</Typography>
                            <Typography noWrap variant="title" component="h3" style={{textAlign:"left"}}>{this.context.apis.getLabel("Phiếu tính tiền").toUpperCase()}</Typography>
                            <Typography noWrap component="div" style={{textAlign:"left"}}>No.{this.state.voucher.so_ct}</Typography>
                        </Grid>
                        <Grid item>
                            {this.state.voucher.con_no!==0 && <img src={qrcode_data} style={{width:84,height:84}}/>}
                            {this.state.voucher.con_no==0 && <Typography style={{fontWeight:700,color:"green"}}>{this.context.apis.getLabel("Đã thanh toán")}</Typography>}
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={4}>
                            {this.context.apis.getLabel("Ngày:")}
                        </Grid>
                        <Grid item xs={8}>
                            <Typography noWrap component="div" style={{textAlign:"right"}}>{Moment(this.state.voucher.ngay_ct).format("DD/MM/YYYY HH:mm A")}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={4}>
                            {this.context.apis.getLabel("Bàn:")}
                        </Grid>
                        <Grid item xs={8}>
                            <Typography noWrap component="div" style={{textAlign:"right"}}>{this.state.voucher.ten_ban||this.state.voucher.ma_ban}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={4}>
                            {this.context.apis.getLabel("Khách hàng:")}
                        </Grid>
                        <Grid item xs={8}>
                            <Typography noWrap component="div" style={{textAlign:"right"}}>{this.state.voucher.ten_kh||"--"}</Typography>
                        </Grid>
                    </Grid>
                </div>
                <TableContainer>
                    <Table  size="small">
                        <TableBody>
                        <TableRow>
                            <TableCell  padding="checkbox">
                                <Typography variant="body2"  noWrap>{this.context.apis.getLabel("SL")}</Typography>
                            </TableCell>
                            <TableCell  padding="checkbox">
                                <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{this.context.apis.getLabel("Đơn giá")}</Typography>
                            </TableCell>
                            <TableCell  padding="checkbox">
                                <Typography variant="body2"  style={{textAlign:"right"}} noWrap>{this.context.apis.getLabel("TT")}</Typography>
                            </TableCell>
                        </TableRow>
                        </TableBody>
                        {details.map(detail=>{
                        return (
                            <TableBody  tabIndex={-1} key={detail.ma_vt} style={{cursor:"pointer"}} onClick={()=>this.handleDetailClick(detail)}>
                                <TableRow>
                                    <TableCell  padding="checkbox" colSpan={3}  style={{borderBottom:"none"}}>
                                        <Typography variant="body2" style={{fontWeight:405}}>{detail.ten_vt}</Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell  padding="checkbox">
                                        <Typography variant="body2"  noWrap>{Numeral(detail.sl_xuat).format()}</Typography>
                                    </TableCell>
                                    <TableCell  padding="checkbox">
                                        <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{Numeral(detail.gia_ban_nt).format()}</Typography>
                                    </TableCell>
                                    <TableCell  padding="checkbox">
                                        <Typography variant="body2" style={{textAlign:"right"}}  noWrap>{Numeral(detail.tien_hang_nt).format()}</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )
                        })}
                    </Table>
                </TableContainer>
                <div style={{borderTop:"1px solid silver",padding:5}}>
                    <Grid container>
                        <Grid item xs={4}>
                            {this.context.apis.getLabel("Cộng:")}
                        </Grid>
                        <Grid item xs={8}>
                            <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.t_tien_nt).format()}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={6}>
                            {this.context.apis.getLabel("Chiết khấu:")}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.t_ck_nt||0).format()}</Typography>
                        </Grid>
                    </Grid>
                    {!!this.state.voucher.tien_evoucher &&
                        <Grid container>
                            <Grid item xs={6}>
                                {this.context.apis.getLabel("Phiếu giảm giá:")}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.tien_evoucher||0).format()}</Typography>
                            </Grid>
                        </Grid>
                    }
                    <Grid container>
                        <Grid item xs={6}>
                            {this.context.apis.getLabel("Phải thanh toán:")}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.t_tt_nt-(this.state.voucher.tien_evoucher||0)).format()}</Typography>
                        </Grid>
                    </Grid>
                    {!!this.state.voucher.tien_thu &&
                    <Grid container>
                        <Grid item xs={6}>
                            {`${this.context.apis.getLabel("Thanh toán")} ${this.context.apis.getLabel(this.state.voucher.ten_pt_thanh_toan)}: `}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.tien_thu).format()}</Typography>
                        </Grid>
                    </Grid>}

                    {!!this.state.voucher.tien_thu2 &&
                        <Grid container>
                            <Grid item xs={6}>
                                {`${this.context.apis.getLabel("Thanh toán")} ${this.context.apis.getLabel(this.state.voucher.ten_pt_thanh_toan2)}: `}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.tien_thu2).format()}</Typography>
                            </Grid>
                        </Grid>
                    }
                    {!!this.state.voucher.tien_paymentByPoints &&
                        <Grid container>
                            <Grid item xs={6}>
                                {`$${this.context.apis.getLabel("Thanh toán")} ${this.context.apis.getLabel("bằng điểm")}: `}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.tien_paymentByPoints).format()}</Typography>
                            </Grid>
                        </Grid>
                    }

                    {!!this.state.voucher.con_no &&
                        <Grid container>
                            <Grid item xs={6}>
                                {this.context.apis.getLabel("Còn lại:")}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.con_no).format()}</Typography>
                            </Grid>
                        </Grid>
                    }
                    {!this.state.voucher.con_no &&
                        <Grid container>
                            <Grid item xs={6}>
                                {this.context.apis.getLabel("Trả lại:")}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography noWrap component="div" style={{textAlign:"right"}}>{Numeral(this.state.voucher.phai_tra).format()}</Typography>
                            </Grid>
                        </Grid>
                    }
                </div>
                {this.state.DetailForm}
                <div style={{borderTop:"1px solid silver",padding:5}}>
                    <Typography variant="caption" style={{textAlign:"center"}} component="div">{this.context.apis.getLabel("Cám ơn. Hẹn gặp lại quý khách")}</Typography>
                </div>
            </div>
        </div>
      )
  }
}
Print.contextType = AuthContext;
Print.propTypes={
  match: PropTypes.any,
  _id: PropTypes.string,
  token: PropTypes.string,
  print:PropTypes.func,
}
export default Print;
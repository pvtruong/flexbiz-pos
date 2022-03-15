import React,{Component} from 'react';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom';
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
import Button from '@material-ui/core/Button';
//import {getLabel,asyncGet,asyncGetData} from '../../API';
import Container from './Container';
import PropTypes from 'prop-types';
import Frag from "flexbiz-core/components/Frag";
import {server_url,id_app,secondaryColor}  from '../../../config';
import Moment from 'moment';
import Numeral from 'numeral';
class PaymentByPoints extends Component{
  constructor(props){
    super(props);
    this.state={
    }
  }
  componentDidMount(){
      this.loadVoucher();
  }
  componentDidUpdate(){
  }
  async loadVoucher(){
    let id = this.props.match.params.id
    try{
        let voucher = await this.context.apis.asyncGetData(this.context.userInfo.token,"pbl",{_id:id});
        if(!voucher) return this.context.alert(this.context.apis.getLabel("Bill này không tồn tại"));
        let currency = await this.context.apis.asyncGetData(this.context.userInfo.token,"currency",{ma_nt:voucher.ma_nt});
        if(!currency) return this.context.alert("Bill không hợp lệ");
        if(!currency.so_diem || !currency.so_tien) return this.context.alert(this.context.apis.getLabel("Chưa khai báo tỷ lệ quy đổi điểm cho ngoại tệ") + " " + voucher.ma_nt);
        let ty_le_quy_doi = currency.so_tien/currency.so_diem;
        let phai_tt = voucher.t_tt - (voucher.tien_evoucher||0);
        let da_tt = (voucher.tien_thu||0)+ (voucher.tien_thu2||0) + (voucher.tien_paymentByPoints);
        this.setState({voucher,ty_le_quy_doi,phai_tt,da_tt});
    }catch(e){
        this.context.alert(e.message);
    }
  }
  async payment(){
    this.context.setProgressStatus(true);
    let {voucher} = this.state;
    let id = voucher._id;
    let url = `${server_url}/api/${id_app}/pbl/payment/${id}?access_token=${this.context.userInfo.token}`;
    try{
        let rs = JSON.parse(await this.context.apis.asyncGet(url));
        voucher.trang_thai ="5";
        this.setState({voucher});
        this.context.alert(rs.rs,null,"green");
    }catch(e){
        this.context.alert(e.message);
    }
  }
  render(){
    let {voucher,phai_tt,da_tt,ty_le_quy_doi} = this.state;
    if(!voucher) return null;
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
        <Frag style={{maxWidth:350}} title={this.context.apis.getLabel("Thanh toán cho bill")}>
            <div style={{backgroundColor:"white",padding:10}}>
                <Typography style={{textAlign:"left"}} component="h3">{this.context.apis.getLabel("Số bill")}: {voucher.so_ct}</Typography>
                <Typography style={{textAlign:"left"}} component="h3">{this.context.apis.getLabel("Ngày")}: {Moment(voucher.ngay_ct).format("DD/MM/YYYY HH:MM A")}</Typography>
                <Typography style={{textAlign:"left"}} component="h3">{this.context.apis.getLabel("Số tiền phải thanh toán")}: {Numeral(phai_tt).format()} VND</Typography>
                <Typography style={{textAlign:"left"}} component="h3">{this.context.apis.getLabel("Số tiền đã thanh toán")}: {Numeral(da_tt).format()} VND</Typography>
                <Typography style={{textAlign:"left"}} component="h3">{this.context.apis.getLabel("Số tiền còn phải thanh toán")}: {Numeral(voucher.con_no).format()} VND</Typography>
                <Typography style={{textAlign:"left"}} component="h3">{this.context.apis.getLabel("Số điểm tương đương")}: {Numeral(voucher.con_no/ty_le_quy_doi).format()} points</Typography>
                {voucher.trang_thai==="1" && voucher.con_no &&
                    <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",marginTop:10}}>
                        <Button variant="contained" color="secondary" onClick={this.payment.bind(this)}>{this.context.apis.getLabel("Thanh toán")}</Button>
                    </div>
                }
                {(voucher.trang_thai==="5" || !voucher.con_no) &&
                    <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",marginTop:10,color:secondaryColor}}>
                        {this.context.apis.getLabel("Bill này đã được thanh toán")}
                    </div>
                }
            </div>
        </Frag>
      </div>
    )
  }
}
PaymentByPoints.contextType = AuthContext;
PaymentByPoints.propTypes={
  match: PropTypes.any,
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
}
class PaymentByPointsPage extends Component{
  render(){
    return (
      <Container requireLogin {...this.props}  showDrawerIfIsDesktop={false}>
        <PaymentByPoints {...this.props} />
      </Container>
    )
  }
}
export default withRouter(withMediaQuery('(max-width:480px)')(PaymentByPointsPage));
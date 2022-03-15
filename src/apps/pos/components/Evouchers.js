import React,{Component} from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import AuthContext from "flexbiz-core/components/auth/Context";
//import {getLabel} from '../../../API';
import equal from 'fast-deep-equal';
import Numeral from 'numeral'
import PropTypes from 'prop-types';
class Evouchers extends Component{
  constructor(props){
    super(props);
    this.state={
        data:this.props.data||[]
    }
  }
  async componentDidMount() {
  }
  componentDidUpdate(oldProps){
    if(!equal(oldProps.data,this.props.data)){
        this.setState({data:this.props.data});
    }
  }
  async addEvoucher(){
    await new Promise((resolve)=>{
        (async ()=>{
            if(!this.refEvoucherForm){
            const {default:EvoucherForm} = await import("./EvoucherForm")
            this.setState({
                EvoucherForm:<EvoucherForm  ref={ref=>this.refEvoucherForm=ref}/>,
            },()=>{
                resolve()
            })
            }else{
                resolve()
            }
        })();
    })
    this.refEvoucherForm.open(this.context.apis.getLabel("Nhập mã phiếu giảm giá"),this.props.ma_kh,(evoucher)=>{
        let data= this.state.data;
        if(data.find(d=>d.ma===evoucher.ma)) return;
        data = [...data,evoucher];
        this.setState({data});
        if(this.props.onDataChange) this.props.onDataChange(data);
    });
  }
  removeEvoucher(evoucher){
    let data= this.state.data.filter(d=>d.ma!==evoucher.ma);
    this.setState({data});
    if(this.props.onDataChange) this.props.onDataChange(data);
  }
  render(){
    return (
        <div>
            {this.state.data.map(row=>{
                return (
                    <Card key={row.ma} style={{marginBottom:3}}>
                        <CardContent  style={{padding:5}}>
                            <div style={{display:"flex",justifyContent:"space-between"}}>
                                <div>
                                    <Typography variant="body1">{`${Numeral(row.so_tien).format()} đ`||`${row.ty_le}%`}</Typography>
                                    <Typography variant="caption">{row.ma} - {row.ten}</Typography>
                                </div>
                                <IconButton onClick={()=>this.removeEvoucher(row)} style={{marginLeft:5}}><RemoveCircleIcon/></IconButton>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
            <Button variant="outlined" color="primary" onClick={this.addEvoucher.bind(this)}>{this.context.apis.getLabel("+ Thêm phiếu giảm giá")}</Button>
            {this.state.EvoucherForm}
        </div>
    )
  }
}
Evouchers.contextType = AuthContext;
Evouchers.propTypes={
  mediaQueryMatches: PropTypes.bool,
  data:PropTypes.array,
  ma_kh:PropTypes.string,
  onDataChange:PropTypes.func,
}
export default Evouchers;
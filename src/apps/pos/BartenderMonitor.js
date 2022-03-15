import React from "react";
import PropTypes from 'prop-types';
import {toast } from 'react-toastify';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import CardContext from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import _ from 'lodash';
import {server_url,primaryColor} from '../../../config'; 
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
import Frag from "flexbiz-core/components/Frag";
import {EmitEvents,gradientBackgroundStyle} from 'flexbiz-core/utils';
import ObjectPicker from "flexbiz-core/components/ObjectPicker";
import Container from './Container';
import CountTime from "./components/CountTime";
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Checkbox from  "flexbiz-core/components/Checkbox";
import Tooltip from '@material-ui/core/Tooltip';
import Moment from "moment";
class BartenderMonitor extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            load:0,
            pbls:[],
            products:[],
            kho:null,
            by_table:true
        }
        this.loadWaitingProducts = this.loadWaitingProducts.bind(this);
        this.pickKho = this.pickKho.bind(this);
        this.billUpdate = this.billUpdate.bind(this);
        this.audio = new Audio('/audio/alert.mp3');
    }
    componentDidMount(){
        this.pickKho();
        EmitEvents.subscribe("pbl:update",this.billUpdate)
        EmitEvents.subscribe("pbl:new",this.billUpdate)
    }
    componentWillUnmount(){
        EmitEvents.unsubscribe("pbl:update",this.billUpdate)
        EmitEvents.unsubscribe("pbl:new",this.billUpdate)
    }
    billUpdate(){
        let {kho} = this.state;
        if(!kho) return;
        toast.info(`${this.context.apis.getLabel("Danh sách món đang chờ đã được cập nhật")}`,{ autoClose: 1500,hideProgressBar:true})
        this.loadWaitingProducts(kho.ma_kho);
    }
    pickKho(){
        this.refObjectPicker.open("dmkho",this.context.apis.getLabel("Chọn cửa hàng"),async (selected)=>{
          this.setState({kho:selected,load:this.state.load+1},()=>{
              this.loadWaitingProducts(selected.ma_kho);
          });
        });
      }
    async loadWaitingProducts(ma_kho){
        this.context.setProgressStatus(true);
        try{
            const options={
                limit:1000000,
                page:0,
                condition:{
                    trang_thai:{$in:["1","3"]},
                    ma_kho:ma_kho
                }
            }
            const pbls = await this.context.apis.asyncGetList(this.context.userInfo.token,"pbl",options);
            let products = pbls.map(p=>p.details.filter(d=>d.sp_yeu_cau_pha_che).map(d=>{
                    d.pbl = p;
                    return d;
                }).filter(p=>(p.sl_xuat||0)<(p.sl_gui_bartender||0)))
                .reduce((a,b)=>a.concat(b),[])
                .sort((a,b)=>new Date(a.time_order).getTime()-new Date(b.time_order).getTime());

            if(!_.isEqual(products,this.state.products)){
                this.setState({products,pbls,load:this.state.load+1});
                this.audio.play();
            }

            this.context.setProgressStatus(false);
        }catch(e){
            this.context.alert(e.message||e);
        }
    }
    async finishTable(n_pbl,options={alert:true}){
        if(options.alert){
            this.context.setProgressStatus(true);
        }
        const pbl = await this.context.apis.asyncGetData(this.context.userInfo.token,"pbl",{_id:n_pbl._id});
        if(pbl){
            pbl.details.filter(d=>d.sp_yeu_cau_pha_che && d.sl_gui_bartender>d.sl_xuat).forEach(product=>{
                product.pbl = pbl;
                this.addFinish(product,product.sl_gui_bartender-product.sl_xuat,false);
            })
            //update current table
            for(let key in pbl){
                n_pbl[key] = pbl[key];
            }
            //save table
            let _pbl = _.cloneDeep(pbl);
            _pbl.details.forEach(d=>{
                delete d.pbl;
            })
            try{
                await this.context.apis.asyncPostList(this.context.userInfo.token,"pbl",_pbl);
                if(options.alert){
                    this.setState({load:this.state.load+1});
                    this.context.setProgressStatus(false);
                    toast.info(`${this.context.apis.getLabel("Danh sách món đang chờ đã được cập nhật")}`,{ autoClose: 1500,hideProgressBar:true})
                }
                
            }catch(e){
                this.context.alert(e.message||e);
            }
        }else{
            this.context.alert(this.context.apis.getLabel("Phiếu này đã không còn tồn tại"));
        }
        
    }
    async finishAll(){
        this.context.setProgressStatus(true);
        let {products} =  this.state;
        let pbls={}
        products.forEach(product=>{
            pbls[product.pbl._id] = product.pbl;
        })
        try{
            await Promise.all(
                Object.values(pbls).map(_pbl=>{
                    return this.finishTable(_pbl,{alert:false});
                })
            )
            this.setState({load:this.state.load+1});
            this.context.setProgressStatus(false);
            toast.info(`${this.context.apis.getLabel("Danh sách món đang chờ đã được cập nhật")}`,{ autoClose: 1500,hideProgressBar:true})
        }catch(e){
            this.context.alert(e.message||e);
        }

        /*let {products} =  this.state;
        let pbls={}
        products.forEach(product=>{
            this.addFinish(product,product.sl_gui_bartender-product.sl_xuat,false);
            pbls[product.pbl._id] = product.pbl;
        })
        try{
            await Promise.all(
                Object.values(pbls).map(_pbl=>{
                    let pbl = _.cloneDeep(_pbl);
                    pbl.details.forEach(d=>{
                        delete d.pbl;
                    })
                    return this.context.apis.asyncPostList(this.context.userInfo.token,"pbl",pbl);
                })
            )
            this.setState({load:this.state.load+1});
            this.context.setProgressStatus(false);
            toast.info(`${this.context.apis.getLabel("Danh sách món đang chờ đã được cập nhật")}`,{ autoClose: 1500,hideProgressBar:true})
        }catch(e){
            this.context.alert(e.message||e);
        }*/

    }
    async addFinish(product,sl=1,save=true){
        
        this.context.setProgressStatus(true);
        product.sl_xuat = product.sl_xuat + sl;

        product.tien_hang_nt = product.sl_xuat * product.gia_ban_nt;
        if(product.ty_le_ck){
            product.tien_ck_nt = Math.round(product.tien_hang_nt*product.ty_le_ck/100);
        }
        product.tien_nt = product.tien_hang_nt - (product.tien_ck_nt||0);


        if(product.sl_xuat>=product.sl_order){
            product.finish_time = new Date();
        } else{
            product.finish_time = null;
        }
        if(save){
            let pbl = _.cloneDeep(product.pbl);
            pbl.details.forEach(d=>{
                delete d.pbl;
            })
            try{
                await this.context.apis.asyncPostList(this.context.userInfo.token,"pbl",pbl);
                this.setState({load:this.state.load+1});
                this.context.setProgressStatus(false);
                toast.info(`${this.context.apis.getLabel("Danh sách món đang chờ đã được cập nhật")}`,{ autoClose: 1500,hideProgressBar:true})
            }catch(e){
                this.context.alert(e.message||e);
            }
        }
    }
    renderByTable(){
        let {pbls} =  this.state;
        let style=gradientBackgroundStyle(primaryColor)
        return (
            <Grid container spacing={1}>
                 {pbls.filter(p=>p.ma_ban && p.details.find(d=>d.sl_xuat<d.sl_gui_bartender)).sort((a,b)=>{
                     return new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
                 }).map(pbl=>{
                    return (
                        <Grid  key={pbl._id} item xs={12} sm={12} md={3} lg={3}>
                            <Card style={{width:"100%",height:"100%",padding:0}}>
                                <CardContext style={{padding:0}}>
                                    <div style={{...style,padding:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                        <div>
                                            <Typography variant="body1"  noWrap component="div">
                                                {pbl.ten_ban}
                                            </Typography>
                                            <Typography variant="caption" noWrap>
                                                {pbl.name_user_created || pbl.user_created} - {Moment(pbl.date_created).format("HH:mm A")}
                                            </Typography>
                                        </div>
                                        <Tooltip title={this.context.apis.getLabel("Hoàn thành bàn này")}>
                                            <Button size="small" variant="contained"   style={{marginLeft:10}}  onClick={()=>this.finishTable(pbl)}>
                                                <DoneAllIcon/>
                                            </Button>
                                        </Tooltip>
                                    </div>
                                    <List container spacing={1} style={{padding:0}}>
                                        {pbl.details.filter(d=>d.sp_yeu_cau_pha_che).sort((a,b)=>{
                                            let a_sl_con_lai = a.sl_gui_bartender -a.sl_xuat;
                                            let b_sl_con_lai = b.sl_gui_bartender -b.sl_xuat;
                                            return  b_sl_con_lai - a_sl_con_lai;
                                        }).map(product=>{
                                            return (
                                                <>
                                                    <ListItem key={product.line.toString()} style={{padding:5}}>
                                                        <div style={{width:"100%"}}>
                                                            <div>
                                                                <div style={{display:"flex",alignItems:"center"}}>
                                                                    <Typography component="div" style={{flex:1}}>
                                                                        {product.sl_xuat}/{product.sl_gui_bartender} - {product.ten_vt}
                                                                    </Typography>
                                                                    {product.sl_xuat<product.sl_gui_bartender && 
                                                                    <Typography variant="caption" component="div" style={{backgroundColor:"red",color:"white",padding:2,margin:2,borderRadius:5,textAlign:"center"}}>
                                                                        <CountTime startTime={product.order_time} finishTime={product.finish_time}/>
                                                                    </Typography>}
                                                                    {product.sl_xuat>=product.sl_gui_bartender && 
                                                                        <DoneIcon style={{color:"green"}}/>
                                                                    }
                                                                </div>
                                                                <Typography component="div" variant="caption">
                                                                    {product.ghi_chu}
                                                                </Typography>
                                                            </div>
                                                            {product.sl_xuat<product.sl_gui_bartender && 
                                                                <div style={{marginTop:5}}>
                                                                    <Tooltip title={this.context.apis.getLabel("Hoàn thành 1 món")}>
                                                                        <Button size="small" color="secondary" variant="outlined"  disabled={product.sl_xuat>=product.sl_gui_bartender} onClick={()=>this.addFinish(product,1)}>
                                                                            <DoneIcon/>
                                                                        </Button>
                                                                    </Tooltip>
                                                                    <Tooltip title={this.context.apis.getLabel("Hoàn thành tất cả các món")}>
                                                                        <Button size="small" color="secondary" variant="outlined"   disabled={product.sl_xuat>=product.sl_gui_bartender}  style={{marginLeft:10}}  onClick={()=>this.addFinish(product,product.sl_gui_bartender-product.sl_xuat)}>
                                                                            <DoneAllIcon/>
                                                                        </Button>
                                                                    </Tooltip>
                                                                </div>
                                                            }
                                                        </div>
                                                    </ListItem>
                                                    <Divider/>
                                                </>
                                            )
                                        })}
                                    </List>
                                </CardContext>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
        )
    }
    renderByProduct(){
        let {products} =  this.state;
        return (
            <>
                 {products.filter(p=>p.sl_xuat<p.sl_gui_bartender).map(product=>{
                    return (
                        <Card key={product.line} style={{marginBottom:5,width:"100%"}}>
                            <CardContext>
                                <Grid container spacing={1}>
                                    <Grid item style={{flexGrow:1,display:"flex",justifyItems:"center",padding:0}}>
                                        
                                        <div>
                                            <Avatar alt={product.ten_vt} style={{width:48,height:48}} variant="square" src={`${product.picture?server_url + product.picture + '?size=X':''}`}/>
                                            <Typography variant="body2" component="div" style={{backgroundColor:"red",color:"white",padding:2,margin:2,borderRadius:5,textAlign:"center"}}>
                                                <CountTime startTime={product.order_time} finishTime={product.finish_time}/>
                                            </Typography>
                                        </div>
                                        <div style={{marginLeft:10}}>
                                            <Typography variant="h5" component="div">
                                                {product.ten_vt}
                                            </Typography>
                                            <Typography component="div">
                                                {this.context.apis.getLabel("Bàn")}: {product.pbl.ten_ban || product.pbl.ma_ban}
                                            </Typography>
                                            <Typography component="div" variant="caption">
                                                {product.ghi_chu}
                                            </Typography>
                                        </div>
                                    </Grid>
                                    <Grid item style={{display:"flex",alignItems:"center",padding:0}}>
                                        <Typography style={{fontWeight:500}}>
                                            {this.context.apis.getLabel("Hoàn thành")} {product.sl_xuat}/{product.sl_gui_bartender}
                                        </Typography>
                                        <Tooltip title={this.context.apis.getLabel("Hoàn thành 1 món")}>
                                            <Button variant="outlined" color="secondary" disabled={product.sl_xuat>=product.sl_gui_bartender} style={{marginLeft:10}} onClick={()=>this.addFinish(product,1)}>
                                                <DoneIcon/>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title={this.context.apis.getLabel("Hoàn thành tất cả các món")}>
                                            <Button variant="outlined"  color="secondary"  disabled={product.sl_xuat>=product.sl_gui_bartender}  style={{marginLeft:10}}  onClick={()=>this.addFinish(product,product.sl_gui_bartender-product.sl_xuat)}>
                                                <DoneAllIcon/>
                                            </Button>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </CardContext>
                        </Card>
                    )
                })}
            </>
        )
    }
    render(){
        let {products,kho,by_table} =  this.state;
        return (
            <div style={{height:"100%",overflow:"auto"}}>
                <Frag title={this.context.apis.getLabel("Các món đang chờ")} actions={
                    <>
                        <Button onClick={this.pickKho}>
                            {this.context.apis.getLabel("Bartender")}: {(kho||{}).ten_kho|| this.context.apis.getLabel("Chọn cửa hàng")}
                        </Button>
                        <Checkbox style={{marginLeft:10}} value={by_table} label={this.context.apis.getLabel("Quản lý theo bàn")}
                            onChange={event=>{
                                this.setState({by_table:event.target.checked})
                            }}
                        />
                    </>
                }>
                    {by_table && this.renderByTable()}
                    {!by_table && this.renderByProduct()}
                    <ObjectPicker ref={ref=>this.refObjectPicker= ref} formSize="sm" fullWidth={true} readOnly={true} hideItemActions={true} hideTableHeader={true} hideHeader={true}
                        disableBackdropClick={true}
                        disableEscapeKeyDown={true}
                        renderItems={({rows})=>{
                            return rows.map(row=>{
                                return (
                                    <Card key={row._id} style={{margin:10}}>
                                        <CardActionArea onClick={()=>{
                                            this.refObjectPicker.pick(row);
                                        }} >
                                            <CardContext>
                                                {row.ten_kho}
                                            </CardContext>
                                        </CardActionArea>
                                    </Card>
                                )
                                
                            })
                        }}
                    />
                </Frag>
                {!!kho && <Button  disabled={products.length===0}  style={{position:"fixed",bottom:5,right:5}} variant="contained" color="primary" onClick={this.finishAll.bind(this)}>
                    {this.context.apis.getLabel("Hoàn thành tất cả các món")}
                </Button>}
            </div>
        )
    }
}
BartenderMonitor.contextType = AuthContext;
BartenderMonitor.propTypes={
  match: PropTypes.any,
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
}
class BartenderMonitorPage extends React.PureComponent{
  componentDidMount(){}
  render(){
    return (
        <Container requireLogin  {...this.props}  showDrawerIfIsDesktop={false}>
            <BartenderMonitor {...this.props}/>
        </Container>
    )
  }
}
BartenderMonitorPage.contextType = AuthContext;
export default withRouter(withMediaQuery('(max-width:480px)')(BartenderMonitorPage));
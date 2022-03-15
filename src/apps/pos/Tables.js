import React,{Component} from 'react';
import {withRouter} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
import {secondaryColor} from "../../../config";
import {hex2rgba,openFullscreen} from 'flexbiz-core/utils'
import Container from './Container';
import PropTypes from 'prop-types';
import Frag from "flexbiz-core/components/Frag";
import {EmitEvents} from 'flexbiz-core/utils';
import {toast} from 'react-toastify';
import tinycolor from "tinycolor2";
class Tables extends Component{
  constructor(props){
    super(props);
    this.tableUpdate = this.tableUpdate.bind(this);
    this.state={
      rows:[],
      groups:[]
    }
  }
  async componentDidMount( ) {
    this.loadTables();
    EmitEvents.subscribe("pbl:update",this.tableUpdate)
    EmitEvents.subscribe("pbl:new",this.tableUpdate)
  }
  componentWillUnmount(){
    EmitEvents.unsubscribe("pbl:update",this.tableUpdate)
    EmitEvents.unsubscribe("pbl:new",this.tableUpdate)
  }
  async tableUpdate(data){
    this.loadTables();
    if(data.trang_thai==="5"){
      let voucher = await this.context.apis.asyncGetData(this.context.userInfo.token,"pbl",{_id:data._id});
      if(voucher && voucher.ma_kho.toUpperCase()===this.props.match.params.ma_kho.toUpperCase()){
        toast.info(this.context.apis.getLabel("Bàn %s đã được thanh toán").replace("%s",voucher.ten_ban),{ autoClose: false,hideProgressBar:true})
      }
    }
  }
  openTable(table){
    this.props.history.push(`/shop/${table.ma_kho.toLowerCase()}/${table.ma_ban.toLowerCase()}`);
    openFullscreen();
  }
  async loadTables(){
    this.context.setProgressStatus(true);
    try{
      let shop = await this.context.apis.asyncGetData(this.context.userInfo.token,"dmkho",{ma_kho:this.props.match.params.ma_kho.toUpperCase()});
      if(!shop) return this.context.alert(this.context.apis.getLabel("Cửa hàng này không tồn tại"));
      let rows = await this.context.apis.asyncGetList(this.context.userInfo.token,"dmban",{
        condition:{
          ma_kho:this.props.match.params.ma_kho.toUpperCase()
        },
        limit:10000
      });
      this.context.setProgressStatus(false);
      if(rows.length===1){
        this.openTable(rows[0]);
      }else{
        let groups = [];
        rows.forEach(row=>{
          let _g = groups.find(g=>g.nh_ban===row.nh_ban);
          if(!_g){
            groups.push({nh_ban:row.nh_ban,ten_nh_ban:row.ten_nh_ban});
          }
        })
        this.setState({rows,groups,shop})
      }
    }catch(e){
      this.context.alert(e.message);
    }
  }
  renderGroup(rows,title,key){
    return (
      <Frag key={key}  title={title || this.context.apis.getLabel("Danh sách bàn")}>
        <Grid container spacing={2} style={{width:"100%"}}>
          {rows.map(row=>{
              let backgroundColor = hex2rgba(row.color||secondaryColor,0.7);
              let color = (tinycolor(backgroundColor).isDark()?"white":"black");
              let src_image = "/images/table.png";
              if(row.picture) src_image = `${this.context.config.server_url}${row.picture}?size=S&access_token=${this.context.userInfo.token}`
              return (
                <Grid key={row._id} item xs={6} sm={4} md={2} lg={2}> 
                  <Card style={{height:"100%",backgroundColor:backgroundColor}}>
                      <CardActionArea onClick={()=>this.openTable(row)}>
                          <CardContent style={{display:"flex",alignItems:"center"}}>
                            <img style={{width:32,height:32}} src={src_image}/>
                            <Typography variant="subtitle1" style={{color:color,textAlign:"left",marginLeft:15}}>{this.context.apis.getLabel(row.ten_ban).toUpperCase()}</Typography>
                          </CardContent>
                      </CardActionArea>
                  </Card>
                </Grid>
              )
          })}
        </Grid>
      </Frag>
    )
  }
  render(){
    const {shop} = this.state;
    if(!shop) return null;
    let trong,total;
    total = this.state.rows.length;
    trong = this.state.rows.filter(r=>r.trang_thai==="0").length;
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <Typography variant="subtitle1" style={{padding:10,paddingBottom:0}}>{this.context.apis.getLabel("Chi nhánh")}: {shop.ten_kho}</Typography>
          <Typography variant="subtitle1" style={{padding:10,paddingBottom:0}}>{`${this.context.apis.getLabel("Còn trống")} ${trong}/${total} ${this.context.apis.getLabel("bàn")}`}</Typography>
        </div>
        {this.state.groups.length>1?
          this.state.groups.map(group=>{
            return this.renderGroup(this.state.rows.filter(r=>r.nh_ban===group.nh_ban),group.ten_nh_ban||group.nh_ban||this.context.apis.getLabel("Khác"),group.nh_ban)
          })
          :
          this.renderGroup(this.state.rows,this.context.apis.getLabel("Danh sách bàn"))
        }
      </div>
    )
  }
}
Tables.contextType = AuthContext;
Tables.propTypes={
  match: PropTypes.any,
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
}
class TablesPage extends Component{
  render(){
    return (
      <Container requireLogin {...this.props}  showDrawerIfIsDesktop={false}>
        <Tables {...this.props} />
      </Container>
    )
  }
}
export default withRouter(withMediaQuery('(max-width:480px)')(TablesPage));
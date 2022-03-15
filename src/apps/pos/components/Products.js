import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import AuthContext from "flexbiz-core/components/auth/Context";
//import {getLabel,asyncGetList} from '../../../API'
import {titleColor,server_url} from '../../../../config'
import PropTypes from 'prop-types';
import equal from 'fast-deep-equal';
import Numeral from 'numeral';
class Products extends React.Component{
  constructor(props){
    super(props);
    this.loadProducts = this.loadProducts.bind(this);
    this.search = this.search.bind(this);
    this.state={
        rows:[]
    }
    this.style = {};
    if(this.props.style){
        this.style = {...this.style,...this.props.style}
    }
  }
  async componentDidMount(){
  }
  componentDidUpdate(oldProps){
    if(oldProps.group!==this.props.group){
        this.loadProducts(this.props.group,this.props.ma_ban,this.props.ma_kho,this.props.ma_kh);
    }
  }
  shouldComponentUpdate(nextProps,nextState){
    if(!equal(nextState.rows,this.state.rows) || nextProps.group!=this.props.group){
        return true;
    }
    return false;
  }
  handleSelectProduct(Product){
    if(this.props.onProductClick){
        this.props.onProductClick(Product);
    }
  }
  async loadProducts(ma_nvt,ma_ban,ma_kho,ma_kh){
    this.context.setProgressStatus(true);
    try{
        let condition={status:true};
        if(ma_nvt){
            condition.ma_nvt = ma_nvt;
        }
        let rows = await this.context.apis.asyncGetList(this.context.userInfo.token,"dmvt",{condition:condition,limit:1000,buildUrl:(url)=>{
            if(ma_ban){
                url = `${url}&ma_ban=${ma_ban}`
            }
            if(ma_kho){
                url = `${url}&ma_kho=${ma_kho}`
            }
            if(ma_kh){
                url = `${url}&ma_kh=${ma_kh}`
            }
            return url;
        }});
        this.setState({rows})
        this.context.setProgressStatus(false);
    }catch(e){
        this.context.alert(e.message);
    }
  }
  async search(condition,ma_ban,ma_kho,ma_kh){
    if(!condition) return;
    condition.status = true;
    this.context.setProgressStatus(true);
    try{
        let rows = await this.context.apis.asyncGetList(this.context.userInfo.token,"dmvt",{condition:condition,limit:1000,buildUrl:(url)=>{
            if(ma_ban){
                url = `${url}&ma_ban=${ma_ban}`
            }
            if(ma_kho){
                url = `${url}&ma_kho=${ma_kho}`
            }
            if(ma_kh){
                url = `${url}&ma_kh=${ma_kh}`
            }
            return url;
        }});
        this.setState({rows})
        this.context.setProgressStatus(false);
    }catch(e){
        this.context.alert(e.message);
    }
  }
  render(){
    return (
        <div style={this.style}>
            <Grid container spacing={1} style={{overflow:"hidden"}}>
                {this.state.rows.map(row=>{
                    return (
                        <Grid key={row._id} item xs={6} sm={4} md={2} lg={2}>
                            <Card style={{height:"100%"}}>
                                <CardActionArea onClick={()=>this.handleSelectProduct(row)} style={{height:"100%"}}>
                                    <CardContent style={{height:"100%"}}>
                                        <div  style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",marginBottom:10}}>
                                            <Avatar alt={row.ten_vt} style={{width:48,height:48}} variant="square" src={`${row.picture?server_url + row.picture + '?size=X':''}`}/>
                                        </div>
                                        <Typography variant="caption" noWrap={false} component="div"  style={{textAlign:"center",color:titleColor}}>{this.context.apis.getLabel(row.ten_vt).toUpperCase()}</Typography>
                                        <Typography variant="body1" noWrap={false}  component="div"  style={{textAlign:"center"}}>{Numeral(row.gia_ban_le/1000).format()}k</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
        </div>
      )
  }
}
Products.contextType = AuthContext;
Products.propTypes={
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
  onProductClick:PropTypes.func,
  group:PropTypes.string,
  ma_ban:PropTypes.string,
  ma_kho:PropTypes.string,
  ma_kh:PropTypes.string,
  style:PropTypes.any
}
export default Products;
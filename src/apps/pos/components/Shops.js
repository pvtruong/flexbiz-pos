import React,{Component} from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import AuthContext from "flexbiz-core/components/auth/Context";
import StoreIcon from '@material-ui/icons/Store';
import {titleColor} from '../../../../config'
import PropTypes from 'prop-types';
class Shops extends Component{
  constructor(props){
    super(props);
    this.state={
        rows:[]
    }
  }
  async componentDidMount() {
      this.loadShops();
  }
  openShop(shop){
    this.props.history.push(`/shop/${shop.ma_kho.toLowerCase()}`);
  }
  async loadShops(){
    this.context.setProgressStatus(true);
    try{
        let rows = await this.context.apis.asyncGetList(this.context.userInfo.token,"dmkho",{limit:1000,condition:{la_cua_hang:true,status:true},cache:true});
        this.context.setProgressStatus(false);
        if(rows.length===1){
            this.openShop(rows[0]);
        }else{
            this.setState({rows})
        }
        
    }catch(e){
        this.context.alert(e.message);
    }
  }
  render(){
    return (
      <Grid container spacing={2} style={{margin:0}}>
        {this.state.rows.map(row=>{
            return (
              <Grid key={row._id} item xs={6} sm={4} md={3} lg={3}>
                  <Card style={{height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}>
                      <CardActionArea onClick={()=>this.openShop(row)}>
                          <CardContent style={{display:"flex",alignItems:"center"}}>
                            <StoreIcon style={{fontSize:64,color:titleColor}}/>
                            <Typography variant="body2"  style={{textAlign:"left",color:titleColor,marginLeft:5}}>{this.context.apis.getLabel(row.ten_kho).toUpperCase()}</Typography>
                          </CardContent>
                      </CardActionArea>
                  </Card>
              </Grid>
            )
        })}
      </Grid>
    )
  }
}
Shops.contextType = AuthContext;
Shops.propTypes={
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any
}
export default Shops;
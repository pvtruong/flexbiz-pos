import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import AuthContext from "flexbiz-core/components/auth/Context";
//import {getLabel,asyncGetList} from '../../../API'
import {mainTextColor,secondaryColor,primaryColor} from '../../../../config';
import PropTypes from 'prop-types';
import equal from 'fast-deep-equal';
import Scrollbar from 'react-scrollbars-custom';
class ProductGroups extends React.Component{
  constructor(props){
    super(props);
    this.state={
        rows:[],
        groupSelected:null
    }
    this.getGroups = this.getGroups.bind(this);
  }
  async componentDidMount() {
      this.loadProductGroups();
  }
  shouldComponentUpdate(nextProps,nextState){
    if(!equal(nextState.rows,this.state.rows) || !equal(nextState.groupSelected,this.state.groupSelected)){
        return true;
    }
    return false;
  }
  handleSelectGroup(group){
    this.setState({groupSelected:group._id});
    if(this.props.onGroupClick){
        this.props.onGroupClick(group);
    }
  }
  async loadProductGroups(){
    this.context.setProgressStatus(true);
    try{
        let rows = await this.context.apis.asyncGetList(this.context.userInfo.token,"dmnvt",{condition:{la_nhom_hang_hoa:true,status:true}});
        this.context.setProgressStatus(false);
        this.setState({rows});
        if(rows.length>0){
            this.handleSelectGroup(rows[0]);
        }
    }catch(e){
        this.context.alert(e.message);
    }
  }
  getGroups(){
      return this.state.rows;
  }
  render(){
    if(this.state.rows.length<2){
        return null;
    }else{
        return (
            <Scrollbar style={{height:65}} noScrollY={true} mobileNative={true}>
                <div style={{display: 'flex',flexWrap: 'nowrap'}}>
                    {this.state.rows.map(row=>{
                        let _style={marginRight:10,minWidth:120,backgroundColor:primaryColor,display:"flex",justifyContent:"center",alignItems:"center"};
                        if(this.state.groupSelected && row._id===this.state.groupSelected){
                            _style.backgroundColor = secondaryColor ;
                        }
                        return (
                            <Card style={_style} key={row._id}>
                                <CardActionArea onClick={()=>this.handleSelectGroup(row)}>
                                    <CardContent>
                                        <Typography variant="body2"  style={{textAlign:"center",color:mainTextColor}} noWrap>{this.context.apis.getLabel(row.ten_nvt).toUpperCase()}</Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        )
                    })}
                </div>
            </Scrollbar>
        )
    }
  }
}
ProductGroups.contextType = AuthContext;
ProductGroups.propTypes={
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
  onGroupClick:PropTypes.func
}
export default ProductGroups;
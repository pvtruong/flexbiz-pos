import React,{Component} from 'react';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import Breadcrumbs from "flexbiz-core/components/Breadcrumbs";
import {withRouter} from 'react-router-dom';
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
//import {asyncGetData} from '../../API';
import Container from './Container';
import _ from 'lodash';
import queryString from 'query-string';
class Report extends React.Component{
  constructor(props){
    super(props);
    this.state={
    }
  }
  async componentDidMount( ) {
    const {default:ReportBase} = await import("flexbiz-core/components/ReportBase")
    this.setState({
      ReportBase:ReportBase
    },()=>{
      this.loadreportInfo();
    })
  }
  shouldComponentUpdate(nextProps){
    if(this.state.reportInfo &&  this.state.reportInfo.code ===nextProps.match.params.code){
      return false;
    }
    return true;
  }
  async componentDidUpdate(prevProps){
    if(!_.isEqual(prevProps.match.params.code,this.props.match.params.code) || !_.isEqual(prevProps.location.search,this.props.location.search)){
      this.loadreportInfo();
    }
  }
  async loadreportInfo(){
    const code= this.props.match.params.code;
    this.context.setProgressStatus(true);
    try{
      let reportInfo = await this.context.apis.asyncGetData(this.context.userInfo.token,"reportinfo",{code:code.toLowerCase()},null,true);
      if(reportInfo){
        let defaultCondition = queryString.parse(this.props.location.search);
        this.setState({code:code,reportInfo:reportInfo,defaultCondition:defaultCondition});
      }else{
        this.context.setProgressStatus(false);
        this.props.history.push(`/404`);
      }
    }catch(e){
      this.context.setProgressStatus(false);
    }
  }
  render(){
    let module_name = this.props.match.params.module;
    let height = (this.props.mediaQueryMatches?"100%":"calc(100vh - 65px - 45px - 30px)");
    return (
      <>
        <div elevation={0} style={{padding:10,backgroundColor:"#fff"}}>
          <Breadcrumbs  root={module_name?[{to:`/m/${module_name}`,title:module_name}]:null}  info={this.state.reportInfo} query={this.state.defaultCondition}/>
        </div>
        <Paper  style={{margin:this.props.mediaQueryMatches?0:10,marginTop:0,padding:0,overflow:"hidden"}}>
          {this.state.reportInfo && this.state.reportInfo.code===this.props.match.params.code &&
            <this.state.ReportBase
              defaultCondition={this.state.defaultCondition}
              fullScreen={this.props.mediaQueryMatches}
              style={{padding:10,height:height}}
              reportInfo={this.state.reportInfo}
              code={this.state.code}
              title={this.state.reportInfo.title} {...this.props}/>
          }
      </Paper>
    </>)
  }
}
Report.contextType = AuthContext;
Report.propTypes={
  match: PropTypes.any,
  history: PropTypes.any,
  location: PropTypes.any,
  mediaQueryMatches: PropTypes.bool,
}
class ReportPage extends Component{
  render(){
    return (
      <Container requireLogin {...this.props}>
        <Report {...this.props} />
      </Container>
    )
  }
}
export default  withRouter(withMediaQuery('(max-width:480px)')(ReportPage));

import React, {Component} from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
//import {getLabel,asyncGetList} from '../../../API'
import DefaultContext from "flexbiz-core/components/auth/Context";
import {formHeaderColor,mainTextColor} from '../../../../config';
class Form extends Component{
  constructor(props){
    super(props);
    this.state={
      open:false,
      tables:[]
    }
  }
  async open(ma_kho,ma_ban,callback){
    this.callback = callback;
    this.ban_hien_tai = ma_ban;
    this.context.setProgressStatus(true);
    try{
        let tables = (await this.context.apis.asyncGetList(this.context.userInfo.token,"dmban",{limit:5000,condition:{ma_kho:ma_kho.toUpperCase()}})).filter(r=>r.trang_thai==="1");
        (tables.find(t=>t.ma_ban.toUpperCase()===ma_ban.toUpperCase())||{}).sel=true;
        this.context.setProgressStatus(false);
        this.setState({open:true,tables:tables});
    }catch(e){
        this.context.alert(e.message);
    }
  }
  close(){
    this.setState({open:false});
  }
  ok(){
      if(this.callback) this.callback(this.state.tables.filter(t=>t.sel))
      this.close();
  }
  check(table,value){
    table.sel = value;
    this.setState({tables:this.state.tables});
  }
  render(){
    if(!this.state.open) return null;
    return(
      <Dialog
        maxWidth={'sm'}
        fullWidth={true}
        open={this.state.open}
        onClose={this.close.bind(this)}
      >
        <DialogTitle style={{backgroundColor:formHeaderColor,color:mainTextColor}}>
          <div style={{display:"flex",alignItems:"center"}}>
            <div style={{flexGrow:1}}>
              <Typography>{this.context.apis.getLabel("Chọn bàn để gộp")}</Typography>
            </div>
            <div style={{display:'flex',flexDirection:"row",alignItems:"center",justifyContent:'flex-end',paddingLeft:10}}>
              <IconButton style={{marginLeft:5}} onClick={this.close.bind(this)}>
                <CloseIcon style={{color:"silver"}}/>
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{padding:10}}>
            <div>
                {this.state.tables.map(table=>{
                    return (
                        <FormControlLabel key={table._id} disabled={table.ma_ban===this.ban_hien_tai} control={
                            <Checkbox  value={table.sel} color="secondary" checked={table.sel} onChange={()=>this.check(table,!table.sel)} />
                        } label={table.ten_ban} />
                    )
                })}
            </div>
            <div style={{display:"flex",justifyContent:"center",padding:10}}>
                <Button variant="contained" onClick={this.ok.bind(this)}>{this.context.apis.getLabel("Gộp")}</Button>
            </div>
        </DialogContent>
      </Dialog>
    )
  }
}
Form.contextType = DefaultContext;
export default Form;

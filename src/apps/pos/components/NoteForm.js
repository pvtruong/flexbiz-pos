import React, {Component} from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
//import {getLabel} from '../../../API'
import DefaultContext from "flexbiz-core/components/auth/Context";
import {formHeaderColor,mainTextColor} from '../../../../config';
class Form extends Component{
  constructor(props){
    super(props);
    this.handleValueChanged = this.handleValueChanged.bind(this);
    this.state={
      open:false,
      dien_giai:""
    }
  }
  shouldComponentUpdate(nexProps,nextState){
      return (nextState.dien_giai!==this.state.dien_giai || this.state.open!==nextState.open)
  }
  open(title,dien_giai,callback){
    this.callback = callback;
    this.setState({title:title,dien_giai:dien_giai||"",open:true});
  }
  close(){
    if(this.callback){
        this.callback(this.state.dien_giai);
    }
    this.setState({open:false});
  }
  handleValueChanged(dien_giai){
    this.setState({dien_giai:dien_giai});
  }
  render(){
    if(!this.state.open) return null;
    let {dien_giai} = this.state;
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
              <Typography>{this.state.title}</Typography>
            </div>
            <div style={{display:'flex',flexDirection:"row",alignItems:"center",justifyContent:'flex-end',paddingLeft:10}}>
              <IconButton style={{marginLeft:5}} onClick={()=>this.setState({open:false})}>
                <CloseIcon style={{color:"silver"}}/>
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent style={{padding:10}}>
            <TextField
                margin="normal"
                fullWidth
                type="text"
                label={""}
                multiline={true}
                value={dien_giai}
                InputLabelProps={{ shrink: true }}
                onChange={(event)=>this.handleValueChanged(event.target.value)}
            />
            <div style={{display:"flex",justifyContent:"center",padding:10}}>
                <Button variant="contained" onClick={this.close.bind(this)}>{this.context.apis.getLabel("Lưu")}</Button>
            </div>

        </DialogContent>
      </Dialog>
    )
  }
}
Form.contextType = DefaultContext;
export default Form;

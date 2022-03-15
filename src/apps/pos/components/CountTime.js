import React from 'react';
import {isEqual as equal} from 'lodash'
import PropTypes from 'prop-types';
class CountTime extends React.PureComponent{
    constructor(props){
      super(props);
      this.count = this.count.bind(this);
      this.state={
        startTime:this.props.startTime,
        finishTime:this.props.finishTime,
        count:"--:--"
      }
    }
    componentDidMount(){
      this.count(this.state.startTime,this.state.finishTime);
      this.inter = setInterval(()=>{
        this.count(this.state.startTime,this.state.finishTime);
      },1000)
    }
    componentDidUpdate(oldProps){
      if(!equal(oldProps.startTime,this.props.startTime) || !equal(oldProps.finishTime,this.props.finishTime)){
        this.setState({startTime:this.props.startTime,finishTime:this.props.finishTime},()=>{
          this.inter = setInterval(()=>{
            this.count(this.state.startTime,this.state.finishTime);
          },1000)
        })
      }
    }
    componentWillUnmount(){
      if(this.inter){
        clearInterval(this.inter);
      }
    }
    count(startTime,finishTime){
      if(!startTime) return;
      let from_time = new Date(startTime).getTime();
      let to_time  = finishTime?new Date(finishTime).getTime(): new Date().getTime();
  
      let time =to_time - from_time;
      time = Math.round(time/1000);
      let minutes = Math.floor(time/60);
      let seconds = time%60;
      let count = `${minutes}:${seconds}`;
      this.setState({count});
      if(finishTime && this.inter){
        clearInterval(this.inter);
      }
    }
    render(){
      return (
        <span>{this.state.count}</span>
      )
    }
}
CountTime.propTypes={
startTime:PropTypes.any,
finishTime:PropTypes.any
}
export default CountTime;
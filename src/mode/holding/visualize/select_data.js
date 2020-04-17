import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
// import './holding.css'
import { Select,Button,Form} from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import Holding from './echart'

const { Option } = Select;


class FileReader2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // csvfile: undefined,
            checkedList: [],
            distinct_time : [],
            time_default : "Select Time",
            date_default : "Select Date",
            date_name : [],
            data_time : [],
            name : [],
            data : [],
            click : false
        };
        this.data = props.data
        this.date = props.date

        this.offsetScrollingRef = React.createRef();

    }


    search = () => {
        this.setState({ click: true });
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { click } = this.state;
        if (prevState.click != click && click) {
            const { current } = this.offsetScrollingRef;
            if (current) {
                current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }

    //------------ filter date---------------//

    Date_onhandleChange(value,data) {
        var data_select = []
        var data_time = []
        this.setState({date_default:value,click:false})
        for(var i=0;i<data.length;i++){
            if(data[i].date === String(value)){
                data_select.push(data[i])
                data_time.push(data[i].time_2.getHours())
            }
        }

        var distinct = [...new Set(data_time)].sort(function(a, b){return a-b})

        this.setState({distinct_time : distinct, date_name:data_select, time_default:"Select Time"})
    }

    //------------filter time---------------//

    Time_onhandleChange(value,data) {
        this.setState({time_default:value,click:false})
        var data_select = []
        var data_name = []
        for(var i=0;i<data.length;i++){
            if(data[i].time_1.getHours() === parseInt(value) || data[i].time_2.getHours() === parseInt(value)){
                data_select.push(data[i])
                data_name.push(data[i].name)
            }
        }
        this.setState({data_time : data_select, name:data_name})
    }

    render(props) {
      return (
        <div>
            <div style={{marginBottom:'1%'}}>
            <Form layout="inline">
                <Form.Item label="Date">
                <Select placeholder="Select Date" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.date_default} onChange={e => this.Date_onhandleChange(e,this.data)}>
                    {this.date.map(flight => (
                        <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                    ))}
                </Select>
                </Form.Item>

                {this.state.date_default !== 'Select Date' ?
                <Form.Item label="Time">
                <Select placeholder="Select Time" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.time_default} onChange={e => this.Time_onhandleChange(e,this.state.date_name)}>
                    {this.state.distinct_time.map(flight => (
                        <Option style={{ fontSize: "1rem" }} key={flight}>{flight}.00 - {flight}.59</Option>
                    ))}
                </Select>
                </Form.Item>
                : null}

                {this.state.date_default !== 'Select Date' && this.state.time_default !== 'Select Time'?
                <Button style={{backgroundColor:'#b47b44',color:'white'}} onClick={this.search}>Search</Button> : null}
                </Form>
                
            </div>
            <div>
                <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: -16 }} ref={this.offsetScrollingRef} />
                </div>
                {this.state.click === true ? 
                    <Holding data={this.state.data_time} name={this.state.name}/>
                : null}
            </div>
        </div>
      );
    }
  }
  FileReader2.propTypes = {
    data: PropTypes.array,
    date: PropTypes.array
  };
  
  
  export default FileReader2;
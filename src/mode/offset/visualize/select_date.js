import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import './select.css'
import { Select,Button,Form  } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import Offset from './offset';

const { Option } = Select;


class FileReader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // csvfile: undefined,
            arr: [{
                name:'',
                coords: [[]],
                date:'',
                time_1:'',
                time_2:'',
                week:''
            }],
            distinct_date : [],
            distinct_time : [],
            select_date : false,
            date_time : [],
            date_name : [],
            time_name : [],
            time_flight : [],
            check_data : false,
            time_default : "Select Time",
            date_default : "Select Date",
            type_default : "Select Section",
            turn_default : "Select Turn Direction",
            type : ['Departure','Arrival'],
            real : [],
            click : false,
            checkbox : [],
            what_select : "Date",
            last: null
        };
        this.data = props.data
        this.check = props.check
        this.date = props.date
        this.offsetScrollingRef = React.createRef();
    }

    search = () => {
        this.setState({ click: true });
    };

    //---------compute ground distance----------//

    distance(lat1, lon1, lat2, lon2, unit) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit==="K") { dist = dist * 1.609344 }
            if (unit==="N") { dist = dist * 0.8684
            // console.log('nmi') 
            }
            return dist;
        }
    }
  
    //-------------- fliter date--------------//

    Date_onhandleChange(value,data) {
        var data_select = []
        var data_time = []
        var dis,dis2
        this.setState({date_default:value,click:false})
        // console.log(data)
        for(var i=0;i<data.length;i++){
            dis = 0
            dis2 = 0
            // console.log(data[i].date, String(value))
            if(data[i].date === String(value)){
                data_select.push(data[i])
                var state = data[i].coords.length-1
                // console.log(state)
                dis = this.distance(13.6902099,100.7449953,data[i].coords[0][1], data[i].coords[0][0], "N")
                dis2 = this.distance(13.6902099,100.7449953,data[i].coords[state][1], data[i].coords[state][0], "N")
                if(dis < dis2) data_time.push(data[i].time_1.getHours())
                else{
                    data_time.push(data[i].time_2.getHours())
                }
                // console.log(data[i])
            }
        }
        var distinct = [...new Set(data_time)].sort(function(a, b){return a-b})

        this.setState({distinct_time : distinct, date_name:data_select, time_default:"Select Time",type_default:"Select Section"})
    }

    //--------------- fliter time------------//

    Time_onhandleChange(value,data) {
        this.setState({time_default:value,click:false})
        var data_select = []
        for(var i=0;i<data.length;i++){
            if(data[i].time_1.getHours() === parseInt(value) || data[i].time_2.getHours() === parseInt(value)){
                data_select.push(data[i])
            }
        }
        this.setState({time_flight : data_select,type_default:"Select Section"})
    }

    //-------------fliter section --------------// 

    Type_onhandleChange(value,data) {

        var before_state = this.state.type_default
        this.setState({type_default:value,click:false,last:before_state})
        // console.log(this.state.type_default,this.state.last)
        var data_select = []
        var name = []
        var data_departure = []
        var data_arrival = []
        var name_departure = []
        var name_arrival = []
        var sumdeparture;
        var sumarrival;
        var dis,dis2;

        for(var i=0;i<data.length;i++){
            sumdeparture = 0
            sumarrival = 0
            var state = data[i].coords.length-1
            // console.log(state)
            dis = this.distance(13.6902099,100.7449953,data[i].coords[0][1], data[i].coords[0][0], "N")
            dis2 = this.distance(13.6902099,100.7449953,data[i].coords[state][1], data[i].coords[state][0], "N")
            // console.log('dis',dis,dis2)
            if(dis < dis2) {
                data_departure.push(data[i])
                name_departure.push(data[i].name)
            }
            else {
                data_arrival.push(data[i])
                name_arrival.push(data[i].name) 
            }
        }

        if(value === 'Departure'){
            data_select = data_departure
            name = name_departure
        }
        else{
            data_select = data_arrival
            name = name_arrival
        }

        this.setState({real : data_select ,checkbox:name})
    }
  
    componentDidUpdate(prevProps, prevState, snapshot) {
        const { click } = this.state;
        if (prevState.click != click && click) {
            const { current } = this.offsetScrollingRef;
            if (current) {
                current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }

    render(props) {
        // console.log(this.data)
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

                {this.state.date_default !== 'Select Date' && this.state.time_default !== 'Select Time' ?
                    <Form.Item label="Section">
                    <Select placeholder="Select Section" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.type_default} onChange={e => this.Type_onhandleChange(e,this.state.time_flight)}>
                        {this.state.type.map(flight => (
                            <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                        ))}
                    </Select>
                    </Form.Item>
                : null}

                {this.state.date_default !== 'Select Date' && this.state.time_default !== 'Select Time' && this.state.type_default !== 'Select Section' ?
                <Button onClick={this.search} style={{backgroundColor:'#b47b44',color:'white'}}>Search</Button> : null}
                </Form>
            </div>
            <div style={{marginBottom:'1%'}}>
                <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: -16 }} ref={this.offsetScrollingRef} />
                </div>
                
                {this.state.click === true ? 
                <Offset data={this.state.real} name={this.state.checkbox} what={this.state.what_select}/>
                : null}
            </div>

        </div>
      );
    }
  }

  FileReader.propTypes = {
    data: PropTypes.array,
    check: PropTypes.bool,
    date: PropTypes.array
  };
  
  
  export default FileReader;
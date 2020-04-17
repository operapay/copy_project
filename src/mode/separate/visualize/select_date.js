import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
// import './select.css'
import { Select,Button,TimePicker,Form } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import Separate from './separate';
// import Separate from './plot'

const { Option } = Select;


class FileReader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // csvfile: undefined,
            runway : [{name:'01R',lat:13.656697,long:100.751831},
            {name:'01L',lat:13.671278,long:100.734664},
            {name:'19L',lat:13.691714,long:100.761033},
            {name:'19R',lat:13.703669,long:100.743178}],
            arr: [{
                name:'',
                coords: [[]],
                date:'',
                time_1:'',
                time_2:'',
                aircraft:''
            }],
            distinct_time : [],
            distinct_name : [],
            data_point : [],
            select_date : false,
            date_name : [],
            time_flight : [],
            time_stamp : '',
            time_default : "Select Time",
            date_default : "Select Date",
            flight_default : "Select Flight",
            real : '00:00:00',
            click : false,
            pick : '00:00:00',
            name : null,
            time_real : []
            // checkedList: [],
        };
        this.data = props.data
        this.check = props.check
        this.date = props.date

        this.offsetScrollingRef = React.createRef();
        // this.getData = this.getData.bind(this);
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

    interpolate(x1,y1,x2,y2,x){
        // console.log(x1,y1,x2,y2,x)
        var diff = ((y2-y1)/(x2-x1))*(x-x1)
        var res = diff+y1
        return res
    }

    timeStringToFloat(time) {
        // console.log(time)
        var hoursMinutes = time.split(':');
        var hours = parseInt(hoursMinutes[0], 10);
        var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
        var seconds = hoursMinutes[2] ? parseInt(hoursMinutes[2], 10) : 0;
        return hours + minutes /60 + seconds/3600;
    }

    FloattoTime(time){
        // console.log(time)
        var hh = time-(time % 1)
        var min = (time%1)*60
        var mm = min-(min%1)
        var seconds = (min%1)*60
        var ss = seconds-(seconds%1)
        // var ss = ((time-hh*60)-mm)%100
        // console.log(hh)
        return hh + ':' + mm + ':' + ss
    }

    compute_newcoords(array,point){
        var first,first_lat,first_long,last,last_lat,last_long
        var res = [{name:'',time:'',data:[]}]
        var time = []
        var num = 0
        for(var i=0;i<array.length;i++){
            first = 0
            first_lat = 0
            first_long = 0
            last = 0
            last_lat = 0
            last_long = 0
            for(var j=1;j<array[i].coords.length;j++){
                first_lat = array[i].coords[j-1][1]
                last_lat = array[i].coords[j][1]
                first_long = array[i].coords[j-1][0]
                last_long = array[i].coords[j][0]
                if((point[0].lat >= first_lat && point[0].lat <= last_lat) && (point[0].long >= first_long && point[0].long <= last_long)){
                    // time_min = array[i].coords[j-1][3]
                    // time_max = data[i].data.coords[j][3]
                    first = this.timeStringToFloat( moment(array[i].coords[j-1][3]).format('HH:mm:ss'))
                    last = this.timeStringToFloat( moment(array[i].coords[j][3]).format('HH:mm:ss'))
                    var point_lat = point[0].lat
                    var point_long = point[0].long
                    var turn = '01R'
                    // console.log('01R')
                    break
                }
                else if((point[1].lat >= first_lat && point[1].lat <= last_lat) && (point[1].long >= first_long && point[1].long <= last_long)){
                    // time_min = array[i].coords[j-1][3]
                    // time_max = data[i].data.coords[j][3]
                    first = this.timeStringToFloat( moment(array[i].coords[j-1][3]).format('HH:mm:ss'))
                    last = this.timeStringToFloat( moment(array[i].coords[j][3]).format('HH:mm:ss'))
                    var point_lat = point[1].lat
                    var point_long = point[1].long
                    var turn = '01L'
                    // console.log('01L')
                    break
                }
                else if((point[2].lat >= last_lat && point[2].lat <= first_lat) && (point[2].long >= last_long && point[2].long <= first_long)){
                    // time_min = array[i].coords[j-1][3]
                    // time_max = data[i].data.coords[j][3]
                    first = this.timeStringToFloat( moment(array[i].coords[j-1][3]).format('HH:mm:ss'))
                    last = this.timeStringToFloat( moment(array[i].coords[j][3]).format('HH:mm:ss'))
                    var point_lat = point[2].lat
                    var point_long = point[2].long
                    var turn = '19L'
                    // console.log('19L')
                    break
                }
                else if((point[3].lat >= last_lat && point[3].lat <= first_lat) && (point[3].long >= last_long && point[3].long <= first_long)){
                    // time_min = array[i].coords[j-1][3]
                    // time_max = data[i].data.coords[j][3]
                    first = this.timeStringToFloat( moment(array[i].coords[j-1][3]).format('HH:mm:ss'))
                    last = this.timeStringToFloat( moment(array[i].coords[j][3]).format('HH:mm:ss'))
                    var point_lat = point[3].lat
                    var point_long = point[3].long
                    var turn = '19R'
                    // console.log('19R')
                    break
                }
                // console.log(first_lat,first_long,last_lat,last_long +' vs ', point[3].lat,point[3].long)
            }
            var res_time1 = this.interpolate(parseFloat(first_lat),first,parseFloat(last_lat),last,point_lat)
            var res_time2 = this.interpolate(parseFloat(first_long),first,parseFloat(last_long),last,point_long)
            // console.log
            var avg = (res_time1+res_time2)/2

            // var mydate = moment(String(array[i].date), 'DD/MM/YYYY');
            // console.log(array[i].coords[j-1][3], '--',this.FloattoTime(avg))
            // console.log(array[i].date)
            var test1 = moment(array[i].date,'DD/MM/YYYY').format("MM/DD/YYYY")+" " + this.FloattoTime(avg)
            // console.log(test1)
            var time1 = moment(test1).toDate();
            // console.log(array[i].coords[j-1][3], '--',time1)
            // console.log(array[i].name,'time_runway',res_time1,res_time2,this.FloattoTime(avg))
            res[i].name = array[i].name
            res[i].time = time1
            res[i].timeint = avg
            res[i].data = array[i]
            res[i].runway = turn
            if(avg !== 0) time.push(time1.getHours())
            if(i < array.length-1){
                res.push({name:'',time:'',data:[]})
            }
            // console.log(res)
        }
        return {res: res ,time:time};
    }
  
    Date_onhandleChange(value,data) {
        // console.log(data)
        var data_select = []
        var name = []
        this.setState({date_default:value,click:false})
        // console.log(data)
        for(var i=0;i<data.length;i++){
            // console.log(data[i].date, String(value))
            if(data[i].date === String(value)){
                data_select.push(data[i])
                // data_time.push(data[i].time_1.getHours())
                // console.log(data[i])
            }
        }
        // console.log(data_select)
        name =this.compute_newcoords(data_select,this.state.runway)
        // name = this.closest(data_select,this.state.runway)
        // console.log('name',name)
        // console.log(data_time)
        // console.log(data_time.sort(function(a, b){return a-b}))
        var distinct = [...new Set(name.time)].sort(function(a, b){return a-b})

        this.setState({distinct_time : distinct, date_name:name.res, time_default:"Select Time",flight_default:"Select Flight",real:'00:00:00'})
    }

    compare( a, b ) {
        if ( a.timeint < b.timeint ){
          return -1;
        }
        if ( a.timeint > b.timeint ){
          return 1;
        }
        return 0;
    }

    Time_onhandleChange(value,data) {
        // console.log(data)
        this.setState({time_default:value,click:false})
        var data_select = []
        var time = []
        for(var i=0;i<data.length;i++){
            if(data[i].time.getHours() === parseInt(value)){
                data_select.push(data[i])
                // var x = moment(data[i].time).format('HH:mm:ss') 
                // time.push(this.timeStringToFloat(moment(data[i].time).format('HH:mm:ss') ))
            }
        }
        data_select.sort( this.compare );
        // console.log('data',data_select)
        // name = this.closest(data_select,this.state.runway)
        // var sort_time = time.sort(function(a, b){return a-b})
        // console.log(time)
        this.setState({time_flight : data_select,distinct_name:data_select, flight_default:"Select Flight",real:'00:00:00'})
    }

    checkselect(){
        var hours = [];
        for(var i =0; i < moment().hour(); i++){
            hours.push(i);
        }
        return hours;

        // if(time !== "Select Time") return true
    }

    onChange = time => {
        // console.log(time);
        this.setState({ time_stamp: time });
    };

    Flight_onhandleChange(value,data) {
        this.setState({flight_default:value,click:false})
        // console.log(value)
        var data_select;
        // var name = []

        for(var i=0;i<data.length;i++){
            if(data[i].name === value){
                data_select = data[i]
                break
            }
        }

        // data_select = this.closest(data,this.state.runway)
        // console.log(data_select)
        this.setState({real : data_select.time, name:data_select.name})
    }

    onChange_picktime(time) {
        // console.log(data)
        // console.log(time);
        // var test = moment(time).format("MM/DD/YYYY")+" " + timeString
        var time_pick = moment.utc(time).toDate();
        // console.log(moment(time_pick).format('HH:mm:ss'))
        this.setState({real : time_pick,click:false})
    }
  
    render(props) {
        // console.log(this.data)
      return (
        <div>
            <div style={{marginBottom:'1%'}}>
            <Form layout="inline">
                {/* <Form layout="inline"> */}
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
                    <div>
                    <Form.Item label="Flight no">
                    <Select placeholder="Select Flight" style={{ width: 400, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.flight_default} onChange={e => this.Flight_onhandleChange(e,this.state.time_flight)}>
                        {this.state.distinct_name.map(flight => (
                            <Option style={{ fontSize: "1rem" }} key={flight.name}>{flight.name} time: {moment(flight.time).format('HH:mm:ss')} </Option>
                        ))}
                    </Select>
                    </Form.Item>
                    <Form.Item label="Time stamp">
                    <TimePicker defaultValue={moment('00:00:00', 'HH:mm:ss')} disabledHours={() => [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]} value={moment(this.state.real, 'HH:mm:ss')} onChange={e => this.onChange_picktime(e)}/>
                    </Form.Item>
                    </div>
                : null}

                {this.state.date_default !== 'Select Date' && this.state.time_default !== 'Select Time' && this.state.flight_default !== 'Select Flight' ?
                <Button style={{backgroundColor:'#b47b44',color:'white'}} onClick={this.search}>Search</Button> : null}
                {/* <Button onClick={this.search}>Search</Button> */}
                </Form>
            </div>
            <div  style={{marginBottom:'1%'}}>
                <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: -16 }} ref={this.offsetScrollingRef} />
                </div>
                {this.state.click === true ? 
                <Separate data={this.state.time_flight} time_pick={this.state.real} name={this.state.name} turn={this.state.date_name}/>
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
import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
// import './offset.css'
import { Select,Button,Form  } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import Feature from './feature';

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
            turn_default : "Select Turn Direction",
            date_default : "Select Date",
            type_default : "Select Section",
            type : ['Departure','Arrival'],
            turn : ['West','East'],
            select_feature : "Date",
            real : [],
            click : false,
            checkbox : [],
            what_select : "Date",
            type_select : []
            // checkedList: [],
        };
        this.data = props.data
        this.date = props.date

        // this.getData = this.getData.bind(this);
    }

    search = () => {
        this.setState({ click: true });
    };

    //------- compute ground distance ---------//

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
  
    //------------fliter date-------------//

    Date_onhandleChange(value,data) {
        var data_select = []
        var data_time = []
        var dis,dis2
        this.setState({date_default:value,click:false})
        // console.log(data)
        for(var i=0;i<data.length;i++){
            dis = 0
            dis2 = 0
            if(data[i].date === String(value)){
                data_select.push(data[i])
                var state = data[i].coords.length-1
                // console.log(state)
                dis = this.distance(13.6902099,100.7449953,data[i].coords[0].lat, data[i].coords[0].long, "N")
                dis2 = this.distance(13.6902099,100.7449953,data[i].coords[state].lat, data[i].coords[state].long, "N")
                if(dis < dis2) data_time.push(data[i].time_1.getHours())
                else{
                    data_time.push(data[i].time_2.getHours())
                }
            }
        }

        var distinct = [...new Set(data_time)].sort(function(a, b){return a-b})

        this.setState({distinct_time : distinct, date_name:data_select, time_default:"Select Time",type_default:"Select Section",turn_default : "Select Turn Direction"})
    }

    //------------ fliter time ------------//

    Time_onhandleChange(value,data) {
        this.setState({time_default:value,click:false})
        var data_select = []
        // console.log(data)
        for(var i=0;i<data.length;i++){
            if(data[i].time_1.getHours() === parseInt(value) || data[i].time_2.getHours() === parseInt(value)){
                data_select.push(data[i])
                // console.log(data[i])
            }
        }
        // console.log(data_select)
        this.setState({time_flight : data_select,type_default:"Select Section",turn_default : "Select Turn Direction"})
    }

    //------------ fliter section ------------//

    Type_onhandleChange(value,data) {
        this.setState({type_default:value,click:false})
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
            dis = this.distance(13.6902099,100.7449953,data[i].coords[0].lat, data[i].coords[0].long, "N")
            dis2 = this.distance(13.6902099,100.7449953,data[i].coords[state].lat, data[i].coords[state].long, "N")
            // console.log(dis)
            if(dis < dis2) {
                data_departure.push(data[i])
                name_departure.push(data[i].name)
            }
            else {
                data_arrival.push(data[i])
                name_arrival.push(data[i].name) 
            }
        }
        //console.log(data_departure , data_arrival)
        if(value === 'Departure'){
            data_select = data_departure
            name = name_departure
        }
        else{
            data_select = data_arrival
            name = name_arrival
        }

        this.setState({type_select : data_select ,checkbox:name,turn_default : "Select Turn Direction"})
    }

    //-----------fliter turn direction-------------//

    Turn_onhandleChange(value,data) {
        // console.log(value)
        this.setState({turn_default:value,click:false})
        var data_select = []
        // var name = []
        var sum_west = 0
        var sum_east = 0
        var data_west = []
        var data_east = []
        var dis_check = 0
        var start = 0
        if(this.state.type_default === 'Departure'){
            for(var i=0;i<data.length;i++){
                sum_east = 0
                sum_west = 0
                dis_check = 0
                for(var j=0;j<data[i].coords.length-1;j++){
                    dis_check = dis_check + this.distance(data[i].coords[j].lat,data[i].coords[j].long,data[i].coords[j+1].lat,data[i].coords[j+1].long,"N")
                    if(dis_check > 30){
                        break
                    }
                    if(data[i].coords[j].long > data[i].coords[j+1].long){
                        sum_west += 1
                    }
                    else if(data[i].coords[j].long < data[i].coords[j+1].long){
                        sum_east += 1
                    }
                }
                if(sum_west > sum_east){
                    data_west.push(data[i])
                    // name_west.push(data[i].name)
                }
                else{
                    data_east.push(data[i])
                    // name_east.push(data[i].name)
                }
            }
        }
        else{
            for(var i=0;i<data.length;i++){
                sum_east = 0
                sum_west = 0
                dis_check = 0
                for(var j=data[i].coords.length-1;j>1;j--){
                    dis_check = dis_check + this.distance(data[i].coords[j].lat,data[i].coords[j].long,data[i].coords[j-1].lat,data[i].coords[j-1].long,"N")
                    if(dis_check > 8){
                        start = j
                        break
                    }
                }
                dis_check = 0
                for(var j=start;j>1;j--){
                    dis_check = dis_check + this.distance(data[i].coords[j].lat,data[i].coords[j].long,data[i].coords[j-1].lat,data[i].coords[j-1].long,"N")
                    if(dis_check > 25){
                        break
                    }
                    if(data[i].coords[j].long > data[i].coords[j-1].long){
                        sum_west += 1
                    }
                    else if(data[i].coords[j].long < data[i].coords[j-1].long){
                        sum_east += 1
                    }
                    // console.log(j)
                }
                // console.log(data[i].name,sum_east,sum_west)
                if(sum_west > sum_east){
                    data_west.push(data[i])
                    // name_west.push(data[i].name)
                }
                else{
                    data_east.push(data[i])
                    // name_east.push(data[i].name)
                }
            }
        }

        if(value === 'West') data_select = data_west
        else data_select = data_east

        this.setState({real : data_select})
    }
  
    render(props) {
        // console.log(this.date)
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
                <Form.Item label="Section">
                <Select placeholder="Select Section" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.type_default} onChange={e => this.Type_onhandleChange(e,this.state.time_flight)}>
                    {this.state.type.map(flight => (
                        <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                    ))}
                </Select>
                </Form.Item>
                : null}

                {this.state.date_default !== 'Select Date' && this.state.time_default !== 'Select Time' && this.state.type_default !== 'Select Section' ?
                <Form.Item label="Turn Direction">
                <Select placeholder="Select Turn Direction" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.turn_default} onChange={e => this.Turn_onhandleChange(e,this.state.type_select)}>
                    {this.state.turn.map(flight => (
                        <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                    ))}
                </Select>
                </Form.Item>
                : null}

                {this.state.date_default !== 'Select Date' && this.state.time_default !== 'Select Time' && this.state.type_default !== 'Select Section' && this.state.turn_default !== "Select Turn Direction" ?
                <Button onClick={this.search} style={{backgroundColor:'#b47b44',color:'white'}}>Search</Button> : null}
                </Form>
            </div>
            <div>
                {this.state.click === true ? 
                <Feature data={this.state.real} type={this.state.type_default}/>
                : null}
            </div>

        </div>
      );
    }
  }

  FileReader.propTypes = {
    data: PropTypes.array,
    date: PropTypes.array,
  };
  
  
  export default FileReader;
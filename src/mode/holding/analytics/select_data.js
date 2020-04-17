import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import './holding.css'
import Papa from 'papaparse'
import { Select,Form } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';


const { Option } = Select;

class FileReader1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            arr: [{
                name:'',
                coords: [[]],
                date: [[]]
            }],
            arr_select : [],
            select : "",
            dataHoldingDist : [],
            dataHoldingTime : [],
            distinct_name : [],
            Idealdis: [],
            Idealtime: [],
            data_select_name : [],
            flight_default : "Select Flight",
            date_default : "Select Date",
            heavy: ['A38','A35','A33','B74','B77','B78'],
            large: ['A31','A32','B73','A20'],
            small: ['AT7'],
            point : [{name: 'LEBIM',lat:13.087447 ,lon: 100.473475, dis:62.04648723260302},
            {name: 'NORTA',lat:14.718789 ,lon: 100.639017, dis:57.16186200443073},
            {name: 'EASTE',lat:14.309667 ,lon: 101.286244, dis:74.06176424138363},
            {name: 'WILLA',lat:14.404717 ,lon: 100.059822, dis:64.93007258847182},
            {name: 'DOLNI',lat:13.294339 ,lon: 101.180114, dis:58.124521104594955}],
            click: false
        };

        this.date = props.date
        this.dataref = props.dataref
        this.data = props.data

    }

    distance(lat1, lon1, lat2, lon2, unit) {
        if ((lat1 === lat2) && (lon1 === lon2)) {
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
            if (unit==="N") { dist = dist * 0.8684 }
            // console.log('nmi') }
            return dist;
        }
    }

    // process(date){
    //     var parts = date.split("/");
    //     return new Date(parts[2], parts[1] - 1, parts[0]);
    // }

    average = list => list.reduce((prev, curr) => prev + curr) / list.length;

    alldata(value,data,date){
        // console.log(data)
        var avg = []
        var avg_time = []
        var res = []
        var selectdata = []
        var count = 0
        var dis = 100000
        var check = false
        var sum = 0
        var dist
        var num = 0
        var mydate1 = moment(String(date), 'DD/MM/YYYY').add(5, 'days');
        var mydate2 = moment(String(date), 'DD/MM/YYYY').add(-5, 'days');
        var newdate;
        // console.log(mydate1,mydate2)
        // console.log(mydate.subtract('1', 'days'))
        for(var i=0;i<data.length-1;i++){
            newdate = moment(String(data[i].date), 'YYYY-MM-DD')
            if(data[i].name === value && mydate1 > newdate && mydate2 < newdate){
                // console.log(moment(String(data[i].date), 'YYYY-MM-DD'))
                // if(mydate1 > newdate && mydate2 < newdate){
                //     // console.log(newdate)
                // }
                if(data[i+1].name === '-'){
                    // console.log(i)
                    selectdata.push('-')
                    // avg.push(sum)
                    // sum = 0
                }
                else{
                    selectdata.push(data[i])
                    // sum = sum + this.distance(data[i].lat,data[i].long,data[i+1].lat,data[i+1].long,"N")
                }
            }
        }
        // console.log('selct',selectdata)
        if(selectdata.length === 0){
            return 0;
        }
        for(var i=0;i<selectdata.length-1;i++){
            if(selectdata[i+1] === '-'){
                check = false
                dis = 100000
                sum = 0
                if(count != 0){
                    avg.push(count)
                    count = 0
                    var mydate = moment(String(selectdata[i].date), 'YYYY-MM-DD');
                    // console.log(mydate)
                    var timeEnd = new Date(moment(mydate).format("MM/DD/YYYY")+" " + selectdata[i].time);
                    // var timeEnd = new Date("01/01/2007 " + selectdata[i].time);
                    var Diff = timeEnd - timeStart;
                    avg_time.push(Diff)
                }
                i = i+2
                num = i
                // console.log('----')
            }
            if(check === false && i < selectdata.length-1){
                dist = this.distance(13.6567,100.7518,selectdata[i].lat,selectdata[i].long,"N")
                if(dist > dis && (dist > 30 & dist < 50)){
                    // console.log(result.data[i][1]," ", dist)
                    sum = sum + 1
                    if(sum > 15){
                        check = true
                        // console.log(sum)
                    }
                    
                }
                dis = this.distance(13.6567,100.7518,selectdata[i].lat,selectdata[i].long,"N")
                count = count + this.distance(selectdata[i].lat,selectdata[i].long,selectdata[i+1].lat,selectdata[i+1].long,"N")
                if(num === i){
                    var mydate = moment(String(selectdata[num].date), 'YYYY-MM-DD');
                    var timeStart = new Date(moment(mydate).format("MM/DD/YYYY")+" " + selectdata[num].time);
                    // var timeStart = new Date("01/01/2007 " + selectdata[num].time);
                }
                // console.log(result.data[i][1]," ", this.distance(13.6567,100.7518,result.data[i][5],result.data[i][4],"N"))
            }
            if(check === true){
                count = 0
            }
            // console.log('count',count)
        }
        res.push(this.average(avg),this.average(avg_time))
        return res
    }

    closest(array,point){
        var i=0;
        var j=0;
        var minDiff=1000000;
        var distance;
        var value;
        var res;
        for(i in array){
            // console.log('i',array[i])
            for(j in point){
                // console.log(point[j])
                var dis = this.distance(array[i][1],array[i][0],point[j].lat,point[j].lon,"N")
                // console.log(dis)
                // var m=Math.abs(dis-array[i][0]);
                if(dis<minDiff){ 
                    minDiff=dis; 
                    value=point[j]
                }
            }
        }
        // res = (num*value)/distance
        // distribute[param].data.push(res)
        return value;
    }

    Date_onhandleChange(value,data) {
        var data_select = []
        var data_name = []
        this.setState({date_default:value})
        // console.log(data)
        for(var i=0;i<data.length;i++){
            // console.log(data[i].date, String(value))
            if(data[i].datetime === String(value)){
                data_select.push(data[i])
                data_name.push(data[i].name)
                // console.log(data[i])
            }
        }
        var distinctName = [...new Set(data_name)]
        // console.log(data_time)
        // console.log(data_time.sort(function(a, b){return a-b}))
        // var distinct = [...new Set(data_time)].sort(function(a, b){return a-b})

        this.setState({distinct_name : distinctName, data_select_name:data_select, flight_default:"Select Flight"})
    }

    onhandleChange(value,data) {
        if(value !== 'Select Flight'){
            this.setState({flight_default:value})
            var data_select = []
            var data_dist = []
            var data_time = []
            var ground = 0
            var speed_size = 0
            var speed_size_des = 0
            var res = this.alldata(value,this.dataref,this.state.date_default)
            for(var i=0;i<data.length;i++){
                if(data[i].name === value){
                    data_select.push(data[i])
                }
            }

            if(this.state.heavy.includes(data_select[0].aircraft)) {
                speed_size = 150*0.868976
                speed_size_des = 500
            }
            else if(this.state.large.includes(data_select[0].aircraft)){
                speed_size = 140*0.868976;
                speed_size_des = 450
            } 
            else if(this.state.small.includes(data_select[0].aircraft)) {
                speed_size = 140*0.868976;    
                speed_size_des = 450
            }

            //-----------------compute part ideal-------------------------------
            var close = this.closest(data_select[0].coords,this.state.point)
            var ideal = Math.round(this.distance(data_select[0].coords[0][1],data_select[0].coords[0][0],close.lat,close.lon,"N") + close.dis)
            var resIdeal = [['Not holding',ideal],['Holding',ideal]]

            var ideal_speedperhour = (this.distance(data_select[0].coords[0][1],data_select[0].coords[0][0],close.lat,close.lon,"N")/speed_size_des) + (close.dis/speed_size)
            var ideal_speed = Math.round(ideal_speedperhour*60)
            var resIdealtime = [['Not holding',ideal_speed],['Holding',ideal_speed]]
            this.setState({Idealdis:resIdeal, Idealtime:resIdealtime})

            var mydate = moment(String(data_select[0].date[0][0]), 'YYYY-MM-DD');
            var timeStart = new Date(moment(mydate).format("MM/DD/YYYY")+" " + data_select[0].date[0][1]);
            // var timeStart = new Date("01/01/2007 " + data_select[0].date[0][1]);
            var timeEnd = new Date(moment(mydate).format("MM/DD/YYYY")+" " + data_select[0].date[data_select[0].date.length-1][1]);
            // var timeEnd = new Date("01/01/2007 " + data_select[0].date[data_select[0].date.length-1][1]);

            var Diff = timeEnd - timeStart;

            for(var i=1;i<data_select[0].coords.length;i++){
                ground = ground + this.distance(data_select[0].coords[i-1][1],data_select[0].coords[i-1][0],data_select[0].coords[i][1],data_select[0].coords[i][0],"N")
            }
            var time_hold = Diff * 0.16666666666667 * 0.0001
            var time_non = res[1] * 0.16666666666667 * 0.0001
            data_dist.push(['Not holding',Math.round(res[0])])
            data_dist.push(['Holding',Math.round(ground)])
            data_time.push(['Not holding',Math.round(time_non)])
            data_time.push(['Holding',Math.round(time_hold)])
            this.setState({dataHoldingDist : data_dist, dataHoldingTime : data_time})
        }
        else{
            this.setState({dataHoldingDist : [], dataHoldingTime : [],Idealdis:[], Idealtime:[]})
        }
    }

    getOption = () => ({
        xAxis: {
            type: 'category',
            axisLabel: {
                show: true,
                interval: 'auto',
                inside: false,
                fontSize: 22,
            }
        },
        yAxis: {
            type: 'value',
            name: 'distance (nmi)',
            nameLocation: 'center',
            nameGap: 80,
            nameTextStyle: {
                fontSize: 20
            },
            axisLabel: {
                show: true,
                interval: 'auto',
                inside: false,
                fontSize: 22,
            }
        },
        series: [
            {
                data: this.state.dataHoldingDist,
                type: 'bar',
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        fontSize: 20
                    }
                },
            },
            {
                type: 'line',
                data: this.state.Idealdis,
                lineStyle: {
                    opacity : 0
                },
                symbol : 'none',
                markLine: {
                    data: [
                        {type: 'average', name: 'Ideal'}
                    ],
                    lineStyle: {
                        width : 2
                    },
                    label: {
                        normal: {
                            show: true,
                            fontSize: 20
                        }
                    },
                }
            }
        ]      
    });
    getOptiontime = () => ({
        xAxis: {
            type: 'category',
            axisLabel: {
                show: true,
                interval: 'auto',
                inside: false,
                fontSize: 22,
            }
        },
        yAxis: {
            type: 'value',
            name: 'time (min)',
            nameLocation: 'center',
            nameGap: 80,
            nameTextStyle: {
                fontSize: 20,
            },
            axisLabel: {
                show: true,
                interval: 'auto',
                inside: false,
                fontSize: 22,
            }
        },
        series: [
            {
                data: this.state.dataHoldingTime,
                type: 'bar',
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        fontSize: 20
                    }
                },
            },
            {
                type: 'line',
                data: this.state.Idealtime,
                lineStyle: {
                    opacity : 0
                },
                symbol : 'none',
                markLine: {
                    data: [
                        {type: 'average', name: 'Ideal'}
                    ],
                    lineStyle: {
                        width : 2
                    },
                    label: {
                        normal: {
                            show: true,
                            fontSize: 20
                        }
                    },
                }
            }
        ]      
    });
  
    render(props) {
    //   console.log(this.date);
      return (
        <div>
            <Form layout="inline">
            <Form.Item label="Date">
            <Select placeholder="Select Date" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.date_default} onChange={e => this.Date_onhandleChange(e,this.data)}>
                {this.date.map(flight => (
                    <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                ))}
            </Select>
            </Form.Item>

            {this.state.date_default !== 'Select Date' ?
            <Form.Item label="Flight no">
            <Select placeholder="Select Flight" style={{ width: 300, fontSize: "1.2rem" }} value={this.state.flight_default} onChange={e => this.onhandleChange(e,this.state.data_select_name)}>
                {this.state.distinct_name.map(flight => (
                    <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                ))}
            </Select>
            </Form.Item>
            : null}
            </Form>

            <ReactEcharts option={this.getOption()} style={{width:'60%', height:500, display:'inline-block'}} />
            <ReactEcharts option={this.getOptiontime()} style={{width:'60%', height:500,  display:'inline-block'}} />
        </div>
      );
    }
  }

  FileReader1.propTypes = {
    data: PropTypes.array,
    date: PropTypes.array,
    dataref: PropTypes.array
  };
  
  
  export default FileReader1;
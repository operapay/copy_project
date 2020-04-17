import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import './select.css'
import { Select,Form } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import SelectDate from './select_date';
import SelectFlight from './select_flight';

const { Option } = Select;


class FileReader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataAll : [{name:'', coords: [['', '', '']],date:'',time_1:'',time_2:'',week:''}],
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
            unit_default : "Select Unit",
            flight_default : "Select Flight no",
            date_default : "Select Date",
            type_default : "Select Type",
            feature : ['Date','Flight no'],
            unit : ['Week','Month'],
            type : ['Departure','Arrival'],
            select_feature : "Date",
            distinct_name : [],
            year:''
        };
        this.test = props.data
        this.check = props.check

        this.getData = this.getData.bind(this);
    }
  

    componentWillMount(){
        if(this.check === true){
            this.getData(this.test)
        }

    }

    componentWillUpdate(nextPorps){
        if(nextPorps.check != this.check && nextPorps.test != this.test){
            console.log(this.check , 'next ', nextPorps.check )
            if(this.check === true){
                this.getData(nextPorps.test)
            }
        }
    }

    //---------countflight---------------//

    uniqueNameFlight(name,data,date){
        var count = 0
        for(var i=1;i<data.length;i++){
            if (data[i].name === '-'){
                count += 1
            }
        }
        return count
    }

    Feature_onhandleChange(value) {
        this.setState({select_feature:value,date_default:"Select Date",flight_default:"Select Flight no",
    time_default: "Select Time", unit_default:"Select Unit",type_default:"Select Type"})
    }

    //-------------- get data to format---------------//
    
    getData(result) {
        this.state.arr = [{
            name:'',
            coords: [[]]
        }]
        var num = 0
        var name = result[0].name
        var date = result[0].name
        var count = this.uniqueNameFlight(name,result,date)
        var dataall_date = []
        var dataall_name = []
        var data_check_time_date = []
        // console.log(count)

        for(var j=0;j<count;j++){
            //console.log(j)
            var mydate = moment(String(result[num].date), 'YYYY-MM-DD');
            // console.log(mydate)
            dataall_name.push(result[num].name)
            for(var i=num;i<=result.length;i++){
                // console.log(num)
                if(result[i].name === '-'){

                    var test1 = moment(mydate).format("MM/DD/YYYY")+" " + result[num].time
                    var time1 = moment(test1).toDate();
                    var local = moment(time1).format('DD/MM/YYYY');
                    //console.log(time1)
                    dataall_date.push(local)
                    var test2 = moment(mydate).format("MM/DD/YYYY")+" " + result[i-1].time
                    var time2 = moment(test2).toDate();
                    var week = moment(time1).format('WW')
                    var fullyear = time1.getFullYear()
                    // console.log('week ',week)
                    this.state.arr[j].date = local
                    this.state.arr[j].time_1 = time1
                    this.state.arr[j].time_2 = time2
                    this.state.arr[j].week = week
                    // console.log('time',time2)
                    // data_check_time_date.push({name: result[num].name,date: date,time_1:time1,time_2:time2})
                    num = i+1
                    //name = result.data[i][1]
                    this.state.arr[j].coords.pop()
                    break;
                }
                this.state.arr[j].coords.push([])
                this.state.arr[j].name = result[i].name
                this.state.arr[j].coords[i-num].push(result[i].long)
                this.state.arr[j].coords[i-num].push(result[i].lat)
                this.state.arr[j].coords[i-num].push(result[i].altitude_ft*0.3048)
            }
            // console.log(j)
            if(j < count-1){
                this.state.arr.push({name:'', coords: [[]],date:'',time_1:'',time_2:'',week:''})
            }
        }

        var distinct = [...new Set(dataall_date)]
        var distinctName = [...new Set(dataall_name)]
        distinct.sort(function(a, b){
            var aa = a.split('/').reverse().join(),
                bb = b.split('/').reverse().join();
            return aa < bb ? -1 : (aa > bb ? 1 : 0);
        });

        this.setState({dataAll: this.state.arr,distinct_date:distinct,distinct_name:distinctName,year:fullyear});
    }
  
    render(props) {
      return (
        <div className="App">
            <h1 style={{color:'#b47b44', margin:'1% 0 1% 0'}}>Offset Visualization</h1>
            <Form layout="inline">
                <Form.Item label="Fliter by">
                    <Select placeholder="Select Feature" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" , marginBottom:'2%'}} value={this.state.select_feature} onChange={e => this.Feature_onhandleChange(e)}>
                        {this.state.feature.map(flight => (
                            <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
                
                { this.state.select_feature === 'Date' ?
                <SelectDate check={this.state.check} data={this.state.dataAll} date={this.state.distinct_date}/>
                : 
                <SelectFlight check={this.state.check} data={this.state.dataAll} name={this.state.distinct_name} year={this.state.year}/>
                }
            
            {/* {this.state.check_data === true ?
            <Offset flight={this.state.flight} check_data={this.state.check_data}/>: null } */}

        </div>
      );
    }
  }

  FileReader.propTypes = {
    data: PropTypes.array,
    check: PropTypes.bool
  };
  
  
  export default FileReader;
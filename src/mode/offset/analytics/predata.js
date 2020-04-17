import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import './offset.css'
import { Select } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import SelectData from './select_data';

const { Option } = Select;


class FileReader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // csvfile: undefined,
            dataAll : [{name:'', coords: [[]],date:'',time_1:'',time_2:''}],
            arr: [{
                name:'',
                coords: [[]],
                date:'',
                time_1:'',
                time_2:''
            }],
            distinct_date : [],
            pre : false
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

    //---------- count flight----------//
    
    uniqueNameFlight(name,data,date){
        var count = 0
        // console.log(data.length)
        for(var i=1;i<data.length;i++){
            if (data[i].name === '-'){
                count += 1
                // console.log(i)
            }
        }
        return count
    }

    //----------get date to format--------//

    getData(result) {
        this.state.arr = [{name:'', coords: [[]],date:'',time_1:'',time_2:''}]
        var num = 0
        var name = result[0].name
        var date = result[0].name
        var count = this.uniqueNameFlight(name,result,date)
        var dataall_date = []

        for(var j=0;j<count;j++){
            var mydate = moment(String(result[num].date), 'YYYY-MM-DD');
            for(var i=num;i<=result.length;i++){
                if(result[i].name === '-'){

                    var test1 = moment(mydate).format("MM/DD/YYYY")+" " + result[num].time
                    var time1 = moment(test1).toDate();
                    var local = moment(time1).format('DD/MM/YYYY');
                    dataall_date.push(local)
                    var test2 = moment(mydate).format("MM/DD/YYYY")+" " + result[i-1].time
                    var time2 = moment(test2).toDate();
                    this.state.arr[j].date = local
                    this.state.arr[j].time_1 = time1
                    this.state.arr[j].time_2 = time2
                    num = i+1
                    this.state.arr[j].coords.pop()
                    break;
                }
                this.state.arr[j].coords.push([{lat:'',long:'',altitude:'',altitude_ft:'',speed:''}])
                this.state.arr[j].name = result[i].name
                this.state.arr[j].coords[i-num].long = result[i].long
                this.state.arr[j].coords[i-num].lat = result[i].lat
                this.state.arr[j].coords[i-num].altitude_ft = result[i].altitude_ft
                this.state.arr[j].coords[i-num].speed = result[i].speed
            }
            if(j < count-1){
                this.state.arr.push({name:'', coords: [[]],date:'',time_1:'',time_2:''})
            }
        }

        var distinct = [...new Set(dataall_date)]
        distinct.sort(function(a, b){
            var aa = a.split('/').reverse().join(),
                bb = b.split('/').reverse().join();
            return aa < bb ? -1 : (aa > bb ? 1 : 0);
        });

        this.setState({dataAll: this.state.arr,distinct_date:distinct, pre:true});
    }
  
    render(props) {
      return (
        <div className="App">
            <h1  style={{color:'#b47b44', margin:'1% 0 1% 0'}}>Offset Analytics</h1>
            
            {this.state.pre === true ?
            <SelectData data={this.state.dataAll} date={this.state.distinct_date}/>: null }

        </div>
      );
    }
  }

  FileReader.propTypes = {
    data: PropTypes.array,
    check: PropTypes.bool
  };
  
  
  export default FileReader;
import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
// import './holding.css'
import { Select,Checkbox,Col } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import Selectdata from './select_data'


class FileReader2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // csvfile: undefined,
            dataAll : [{name:'', coords: [['', '', '']],date:'',time_1:'',time_2:'',aircraft:''}],
            arr: [{
                name:'',
                coords: [[]],
                date:'',
                time_1:'',
                time_2:'',
                aircraft:''
            }],
            distinct_name : [],
            distinct_date : []

        };
        this.test = props.data
        this.check = props.status
        this.dataref = props.dataref

        this.getData = this.getData.bind(this);
    }
  
    componentWillMount(){
        if(this.check === false){
            this.getData(this.test)
        }
    }

    componentWillUpdate(nextPorps){
        if(nextPorps.check !== this.check && nextPorps.test !== this.test){
            if(this.check === false){
                this.getData(nextPorps.test)
            }
        }
    }

    //------------ count flight-----------//

    uniqueNameFlight(name,data,date){
        var count = 0
        for(var i=1;i<data.length;i++){
            if (data[i].name === '-'){
                count += 1
            }
        }
        return count
    }

    //--------- compute ground distance----------//

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

    getData(result) {
        this.state.arr = [{
            name:'',
            coords: [[]],
            date: [[]],
            aircraft:'',
            datetime:''
        }]
        var num = 0
        var name = result[0].name
        var date = result[0].name
        var count = this.uniqueNameFlight(name,result,date)
        var dis = 100000
        var arr_name = []
        var arr_date = []
        var check = false
        var sum = 0
        var dist

        for(var j=0;j<count;j++){
            dis = 100000
            check = false
            sum = 0
            for(var i=num;i<=result.length;i++){

                //------------- check end data per flight--------------//

                if(result[i].name === '-'){
                    if(this.distance(13.6567,100.7518,result[num].lat,result[num].long,"N") < this.distance(13.6567,100.7518,result[i-1].lat,result[i-1].long,"N")){
                        check = false
                    }
                    this.state.arr[j].aircraft = result[i-1].aircraft
                    num = i+1
                    this.state.arr[j].coords.pop()
                    this.state.arr[j].date.pop()
                    break;
                }

                this.state.arr[j].coords.push([])
                this.state.arr[j].date.push([])
                this.state.arr[j].coords[i-num].push(result[i].long)
                this.state.arr[j].coords[i-num].push(result[i].lat)
                this.state.arr[j].coords[i-num].push(result[i].altitude_ft*0.3048)
                this.state.arr[j].date[i-num].push(result[i].date)
                this.state.arr[j].date[i-num].push(result[i].time)
                if(check === false){
                    dist = this.distance(13.6567,100.7518,result[i].lat,result[i].long,"N")

                    //-------------- check holding-------------//

                    if(dist > dis && (dist > 30 & dist < 50)){
                        sum = sum + 1
                        if(sum > 15){
                            check = true
                            name = result[i].name
                            var mydate = moment(String(result[i].date), 'YYYY-MM-DD');
                            var local = moment(mydate).format('DD/MM/YYYY');

                        }
                        
                    }
                    dis = this.distance(13.6567,100.7518,result[i].lat,result[i].long,"N")
                }
            }
            if(check === true){
                this.state.arr[j].name = name
                this.state.arr[j].datetime = local
                arr_date.push(local)

            }
            if(j < count-1){
                this.state.arr.push({name:'', coords: [[]], date:[[]],aircraft:'',datetime:''})
            }
        }

        var distinctDate = [...new Set(arr_date)]
        distinctDate.sort(function(a, b){
            var aa = a.split('/').reverse().join(),
                bb = b.split('/').reverse().join();
            return aa < bb ? -1 : (aa > bb ? 1 : 0);
        });

        this.setState({dataAll: this.state.arr,  distinct_date:distinctDate});
    }

  
    render(props) {
    //   console.log(this.dataref);
      return (
        <div className="App">
          <h1 style={{color:'#b47b44', margin:'1% 0 1% 0'}}>Holding Analytics</h1>
          <Selectdata data={this.state.dataAll} date={this.state.distinct_date} dataref={this.dataref}/>
        </div>
      );
    }
  }
  FileReader2.propTypes = {
    data: PropTypes.array,
    status: PropTypes.bool,
    dataref: PropTypes.array
  };
  
  
  export default FileReader2;
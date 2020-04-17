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
            dataAll : [{name:'', coords: [['', '', '']],date:'',time_1:'',time_2:''}],
            arr: [{
                name:'',
                coords: [[]],
                date:'',
                time_1:'',
                time_2:''
            }],
            distinct_date : [],

        };
        this.test = props.data
        this.check = props.check
        
        this.getData = this.getData.bind(this);
        // this.updateData = this.updateData.bind(this);
    }
  
    componentWillMount(){
        if(this.check === true){
            this.getData(this.test)
        }
    }

    componentWillUpdate(nextPorps){
        if(nextPorps.check !== this.check && nextPorps.test !== this.test){
            console.log(this.check , 'next ', nextPorps.check )
            if(this.check === true){
                this.getData(nextPorps.test)
            }
        }
    }

    //----------- count flight------------//

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

    //---------- compute ground distance--------//

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
        // console.log(result.length)
        this.state.arr = [{ name:'',coords: [[]],date:'',time_1:'',time_2:''}]
        var num = 0
        var name = result[0].name
        var date = result[0].name
        var count = this.uniqueNameFlight(name,result,date)
        var dis = 100000
        var check = false
        var sum = 0
        var dist
        var arr_date = []

        for(var j=0;j<count;j++){
            dis = 100000
            check = false
            sum = 0
            var mydate = moment(String(result[num].date), 'YYYY-MM-DD');
            for(var i=num;i<=result.length;i++){
                if(result[i].name === '-'){

                    //----------- check arrival-----------//

                    if(this.distance(13.6567,100.7518,result[num].lat,result[num].long,"N") < this.distance(13.6567,100.7518,result[i-1].lat,result[i-1].long,"N")){
                        check = false
                    }
                    var test1 = moment(mydate).format("MM/DD/YYYY")+" " + result[num].time
                    var time1 = moment(test1).toDate();
                    var local = moment(time1).format('DD/MM/YYYY');
                    var test2 = moment(mydate).format("MM/DD/YYYY")+" " + result[i-1].time
                    var time2 = moment(test2).toDate();
                    num = i+1
                    this.state.arr[j].coords.pop()
                    break;
                }
                this.state.arr[j].coords.push([])
                this.state.arr[j].name = result[i].name
                this.state.arr[j].coords[i-num].push(result[i].long)
                this.state.arr[j].coords[i-num].push(result[i].lat)
                this.state.arr[j].coords[i-num].push(result[i].altitude_ft*0.3048)
                if(check === false){
                    dist = this.distance(13.6567,100.7518,result[i].lat,result[i].long,"N")

                    //------------- check holding-------------//

                    if(dist > dis && (dist > 30 & dist < 50)){
                        sum = sum + 1
                        if(sum > 15){
                            check = true
                            name = result[i].name
                        }
                        
                    }
                    dis = this.distance(13.6567,100.7518,result[i].lat,result[i].long,"N")
                }
            }
            if(check === true){
                this.state.arr[j].time_1 = time1
                this.state.arr[j].time_2 = time2
                this.state.arr[j].date = local
                arr_date.push(local)
            }

            if(j < count-1){
                this.state.arr.push({name:'', coords: [[]],date:'',time_1:'',time_2:''})
            }
        }

        var distinctDate = [...new Set(arr_date)]
        distinctDate.sort(function(a, b){
            var aa = a.split('/').reverse().join(),
                bb = b.split('/').reverse().join();
            return aa < bb ? -1 : (aa > bb ? 1 : 0);
        });
        this.setState({dataAll: this.state.arr, distinct_date:distinctDate});
    }

  
    render(props) {
    //   console.log(this.state.csvfile);
      return (
        <div className="App">
          <h1 style={{color:'#b47b44', margin:'1% 0 1% 0'}}>Holding Visualization</h1>
          <Selectdata data={this.state.dataAll} date={this.state.distinct_date}/>
        </div>
      );
    }
  }
  FileReader2.propTypes = {
    data: PropTypes.array,
    check: PropTypes.bool
  };
  
  
  export default FileReader2;
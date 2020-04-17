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
            distinct_week : [],
            distinct_month : [],
            data_selected : [],
            check_data : false,
            time_default : "Select",
            unit_default : "Select Unit",
            flight_default : "Select Flight no",
            unit : ['Week','Month'],
            real : [],
            click : false,
            checkbox : [],
            distinct_time : [],
            what_select : "Flight no"
            // checkedList: [],
        };
        this.data = props.data
        this.check = props.check
        this.name = props.name
        this.year = props.year

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
  
    //----------fliter same flight no but it have date +- 5 day from this date ------------//

    Name_onhandleChange(value,data) {
        var data_select = []
        var data_month = []
        var data_week = []
        this.setState({flight_default:value,click:false})
        // console.log(data)
        for(var i=0;i<data.length;i++){
            // console.log(data[i].date, String(value))
            if(data[i].name === value){
                data_select.push(data[i])
                data_month.push(data[i].time_1.getMonth())
                data_week.push(data[i].week)
                // console.log(data[i])
            }
        }
        var distinctMonth = [...new Set(data_month)]
        var month = []
        for(var i=0;i<distinctMonth.length;i++){
            month.push([distinctMonth[i],moment.months(distinctMonth[i])])
        }

        var distinctWeek = [...new Set(data_week)]
        var week = []
        var dateofweek1,dateofweek2;
        for(var i=0;i<distinctWeek.length;i++){
            dateofweek1 = moment(this.getDateOfWeek(distinctWeek[i],this.year)).format('DD/MM/YYYY')
            dateofweek2 = moment(this.getDateOfWeek(distinctWeek[i],this.year)).add(6,'days').format('DD/MM/YYYY')
            week.push([distinctWeek[i],dateofweek1+'-'+dateofweek2])
            // moment(this.getDateOfWeek(distinctWeek[i],2019)).format('DD/MM/YYYY')
        }
        // console.log(week)

        this.setState({data_selected:data_select, distinct_month : month, distinct_week:week, time_default:"Select", unit_default:"Select Unit"})
    }

    //-------------change date to week number------------//

    getDateOfWeek(w, y) {
        return moment().day("Monday").year(y).week(w)
    }

    Unit_onhandleChange(value) {
        this.setState({unit_default:value,click:false})
        var data_select = null
        // console.log(data)
        if(value === "Week"){
            data_select = this.state.distinct_week
        }
        else{
            data_select = this.state.distinct_month
        }
        this.setState({distinct_time:data_select, time_default:"Select"})
    }

    //---------fliter time --------------//

    Time_onhandleChange(value,data) {
        this.setState({time_default:value,click:false})
        var data_select = []
        if(this.state.unit_default === "Week"){
            for(var i=0;i<data.length;i++){
                // console.log(data[i].week, "vs" , value)
                if(String(data[i].week) === value){
                    data_select.push(data[i])
                }
            }
        }
        else{
            for(var i=0;i<data.length;i++){
                // console.log(data[i].time_1.getMonth(), "vs" , value)
                if(String(data[i].time_1.getMonth()) === value){
                    data_select.push(data[i])
                }
            }
        }

        // console.log(data_select)
        this.setState({real : data_select})

    }
  
    render(props) {
        // console.log(this.data)
      return (
          <div>
            <div>
                <Form layout="inline">
                    <Form.Item label="Flight no">
                    <Select placeholder="Select Flight no" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.flight_default} onChange={e => this.Name_onhandleChange(e,this.data)}>
                        {this.name.map(flight => (
                            <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                        ))}
                    </Select>
                    </Form.Item>
                    {this.state.flight_default !== 'Select Flight no' ?
                    <Form.Item label="Unit per">
                    <Select placeholder="Select Unit" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.unit_default} onChange={e => this.Unit_onhandleChange(e)}>
                        {this.state.unit.map(flight => (
                            <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                        ))}
                    </Select>
                    </Form.Item>
                    : null}
                    {this.state.flight_default !== 'Select Flight no' && this.state.unit_default !== 'Select Unit' ?
                    <Form.Item label={this.state.unit_default}>
                    <Select placeholder="Select" style={{ width: 200, fontSize: "1.2rem", paddingRight:"100 px" }} value={this.state.time_default} onChange={e => this.Time_onhandleChange(e,this.state.data_selected)}>
                        {this.state.distinct_time.map(flight => (
                            <Option style={{ fontSize: "1rem" }} key={flight[0]}>{flight[1]}</Option>
                        ))}
                    </Select>
                    </Form.Item>
                    : null}
                    {this.state.flight_default !== 'Select Flight no' && this.state.unit_default !== 'Select Unit' && this.state.time_default !== 'Select' ?
                    <Button onClick={this.search} disabled={this.state.button_search} style={{backgroundColor:'#b47b44',color:'white'}}>Search</Button> : null}
                    {/* <Button onClick={this.search}>Search</Button> */}
                </Form>
            </div>
            <div>
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
    name: PropTypes.array,
    year: PropTypes.number
  };
  
  
  export default FileReader;
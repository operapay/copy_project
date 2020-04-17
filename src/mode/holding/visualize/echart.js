import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import './holding.css'
import { Select,Checkbox,Col } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import BlockScrolling from "../../../BlockScrolling";

const { Option } = Select;

var map = {
    center: [100.7395539,13.6983666], //mahamek
    zoom: 10,
    // pitch: 100,
    altitudeScale: 3.28,
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a','b','c','d'],
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
    }),
}


class FileReader2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data : [],
            scatter: [],
            checkedList: [],
        };
        this.test = props.data
        this.name = props.name
        
    }
  
    //-------------- label name flight------------//

    onhandleChange(value,data) {
        var data_select = []
        var data_scatter = []
        this.setState({checkedList : value})
        for(var j=0;j<value.length;j++){
            for(var i=0;i<data.length;i++){
                if(data[i].name === value[j]){
                    var state = Math.floor((data[i].coords.length)/2)
                    data_select.push(data[i])
                    data_scatter.push([data[i].coords[state][0],data[i].coords[state][1],data[i].coords[state][2],data[i].name])
                }
            }
        }
        this.setState({data : data_select,scatter:data_scatter})
    }

    //--------------- draw chart----------------//
    getOption = () => ({
        maptalks3D: map, 
        series: [
            {
                type: 'scatter3D',
                coordinateSystem: 'maptalks3D',
                itemStyle: {
                    color: 'rgb(50, 50, 150)',
                    opacity: 1
                },
                data: this.state.scatter,
                symbolSize: 1,
                label: {
                    show: true,
                    formatter: function (data) {
                        return data[3];
                    },
                    position: 'insideTop'
                },
            },
            {
                type: 'lines3D',
                coordinateSystem: 'maptalks3D',
                effect: {
                    show: true,
                    constantSpeed: 40,
                    trailWidth: 2,
                    trailLength: 0.05,
                    trailOpacity: 1,
                },
                //blendMode: 'lighter',
                polyline: true,
                lineStyle: {
                    width: 2,
                    color: 'rgb(50, 60, 170)',
                    opacity: 0.5
                },
                data: this.state.data
            }
        ],
    });

  
    render(props) {
    //   console.log(this.state.csvfile);
      return (
        <div>
            <Col>
                <Select
                    mode="multiple"
                    style={{ width: '50%' ,marginBottom:'2%'}}
                    placeholder="Please select flight"
                    value={this.state.checkedList}
                    // defaultValue={['a10', 'c12']}
                    onChange={e => this.onhandleChange(e,this.test)}
                    //options={this.check}
                >
                    {this.name.map(flight => (
                            <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                    ))}
                </Select>
            </Col>
            <BlockScrolling>
            <ReactEcharts option={this.getOption()}  style={{width:'100%', height:800, border:'1px solid lightgray'}} />
            </BlockScrolling>
        </div>
      );
    }
  }
  FileReader2.propTypes = {
    data: PropTypes.array,
    name: PropTypes.array
  };
  
  
  export default FileReader2;
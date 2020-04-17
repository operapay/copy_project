import React from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import './holding.css'
import Papa from 'papaparse'
import { Select, Button,Form } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import Detect from './detect_holding'


const { Option } = Select;

class FileReader1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            csvfile: undefined,
            status : true,
            data : null,
            upload: true
            
        };

        this.test = props.data
        this.check = props.check
        this.updateData = this.updateData.bind(this)
    }

    
    handleChange = event => {
        this.setState({
          csvfile: event.target.files[0],
          upload: false
        });
    };
    

    importCSV = () => {
        const { csvfile } = this.state;
        Papa.parse(csvfile, {
          complete: this.updateData,
          header: true
        });
    };
    
    updateData(result) {
        var rawdata = result.data;
        this.setState({data : rawdata, status:false})

    }

    render(props) {
      // console.log(this.state.data);
      return (
        <div className="App">
            <h2>Import reference .csv file</h2>
            <input
                className="csv-input"
                type="file"
                ref={input => {
                this.filesInput = input;
                }}
                name="file"
                placeholder={null}
                onChange={this.handleChange}
            />
            <p />
            <Button style={{backgroundColor:'#b47b44',color:'white'}} onClick={this.importCSV} disabled={this.state.upload}> Upload now!</Button>
            
            {this.state.status === false ? 
            <Detect data={this.test} status={this.state.status} dataref={this.state.data}/>
            : null}
            
        </div>
      );
    }
  }

  FileReader1.propTypes = {
    data: PropTypes.array,
    check: PropTypes.bool
  };
  
  
  export default FileReader1;
import { Card,Button } from 'antd';
import React from "react";
// import Offset from '../../visualize/offset';
import Offset from './visualize/select_data'
import OffsetAnalyze from './analytics/predata'
import Papa from 'papaparse'
import './offset.css'
// import { Button } from 'antd/lib/radio';

const tabList = [
    {
      key: 'tab1',
      tab: 'visualize',
    },
    {
      key: 'tab2',
      tab: 'analyze',
    },
];

class Mode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 'tab1',
      csvfile: undefined,
      data : null,
      check : false,
      upload : true
    };
    // this.test = props.data

    // this.getData = this.getData.bind(this);
    this.updateData = this.updateData.bind(this);
  }

    onTabChange = (key, type) => {
      console.log(key, type);
      this.setState({ [type]: key });
    };

    handleChange = event => {
      this.setState({
        csvfile: event.target.files[0],
        check: false,
        upload:false
      });
    };
  
    //----------read file import----------------//
    
    importCSV = () => {
      const { csvfile } = this.state;
      Papa.parse(csvfile, {
        complete: this.updateData,
        header: true
      });
    };
  
    updateData(result) {
      var rawdata = result.data;
      this.setState({data : rawdata, check : true, key : 'tab1'})
      // this.forceUpdate();
    }
  
    render() {
      const contentList = {
        tab1: <Offset check={this.state.check} data={this.state.data}/>,
        tab2: <OffsetAnalyze check={this.state.check} data={this.state.data}/>,
      };
      // console.log(this.state.csvfile)
      return (
        <div className='importbar'>
          <div style={{marginLeft:'80px'}}>
            <h2>Import offset .csv file</h2>
            <input
                className="csv-input"
                type="file"
                ref={input => {
                this.filesInput = input;
                }}
                name="upload" 
                id="upload" 
                // name="file"
                placeholder={null}
                onChange={this.handleChange}
                // style={{color:'#b47b44'}}
            />
            <Button style={{backgroundColor:'#b47b44',color:'white',marginTop:'1%', display:'flex'}} onClick={this.importCSV} disabled={this.state.upload}> Upload now!</Button>
          </div>
          {this.state.check === true ? 
          <div>
            <Card 
              style={{ width: '100%',textAlign:'center'}}
              // title="Card title"
              tabList={tabList}
              activeTabKey={this.state.key}
              onTabChange={key => {
                this.onTabChange(key, 'key');
              }}
            >
              {contentList[this.state.key]}
            </Card>
          </div>
          : null}
        </div>
      );
    }
  }

  export default Mode;  


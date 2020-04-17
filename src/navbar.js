import { Card } from 'antd';
// import 'antd/dist/antd.css';
import React from "react";
import Offset from './mode/offset/offset';
import Holding from './mode/holding/holding';
import Separate from './mode/separate/separate';
import './App.css'

const tabList = [
    {
      key: 'tab1',
      tab: 'Offset',
    },
    {
      key: 'tab2',
      tab: 'Holding',
    },
    {
      key: 'tab3',
      tab: 'Wake separate',
    },
];

const contentList = {
    tab1: <Offset/>,
    tab2: <Holding/>,
    tab3: <Separate/>,
};

class Home extends React.Component {
    state = {
      key: 'tab1',
    };
  
    onTabChange = (key, type) => {
      console.log(key, type);
      this.setState({ [type]: key });
    };
  
    render() {
      return (
        <div className='navbar'>
          <Card
            style={{ width: '100%' , fontSize : '2rem !important',backgroundColor:'#5886af',fontFamily: 'Comic Sans MS'}}
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
      );
    }
  }
  
export default Home;  


import React, { Component } from 'react';
import SankeyGraph from './component/sandkey/SankeyGraph';

class App extends Component { 
  state = { 
      data: null 
  }; 
  componentDidMount() { 
      this.getData("./data/energy.json"); 
  } 
  getData = uri => { 
      fetch(uri, { 
      headers: { 
      "Content-Type": "application/json", 
      "Accept": "application/json" 
      } 
      }) 
      .then(res => { 
        return res.json(); 
      }) 
      .then(data => { 
        this.setState({ data }); 
      }); 
  }; 
  
  render() { 
    const { data } = this.state; 
    if (data == null) {
      return null;
    }
    return (
          <div>
          <SankeyGraph
            height={500}
            width={1000}
            margin_top={40}
            margin_right={40}
            margin_bottom={100}
            margin_left={100}
            id="d3-sankey" 
            sankeyData = {this.state.data}
            nodePadding = {10} 
            nodeWidth = {15}
            colorCategory = {20}
          />
        </div>
    );
  } 
}

  export default App;
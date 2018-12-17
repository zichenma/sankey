import React, { Component } from 'react';
import SandkeyGraph from './component/sandkey/SandkeyGraph';

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
          <SandkeyGraph
            height={500}
            width={1000}
            id="d3-sankey" 
            sankeyData = {this.state.data}
            nodePadding = {10} 
            nodeWidth = {15}
            colorCategory = {'20'}
          />
        </div>
    );
  } 
}

  export default App;
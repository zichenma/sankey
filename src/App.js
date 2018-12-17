import React, { Component } from 'react';
import SandkeyGraph from './component/sandkey/SandkeyGraph';

class App extends Component { 
  state = { 
      data: null 
  }; 
  componentDidMount() { 
      this.getData("./data/sankey.json"); 
  } 
  getData = uri => { 
      fetch("./data/sankey.json", { 
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
            height={300}
            width={700}
            id="d3-sankey" 
            sankeyData = {this.state.data}
            nodePadding = {40} 
            nodeWidth = {36}
            colorCategory = {'20'}
          />
        </div>
    );
  } 
}

  export default App;
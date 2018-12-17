import React, { Component } from 'react';
import SandkeyGraph from './particle/SandkeyGraph';

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
  console.log(res); 
  return res.json(); 
  }) 
  .then(data => { 
  // successful got the data 
  this.setState({ data }); 
  }); 
  }; 
  
  render() { 
  // failed 
  const { data } = this.state; 
  console.log(data);  // null 
  console.log(this.state); // {data: null}
  return (
        <div>
        <SandkeyGraph
          height={300}
          width={700}
          id="d3-sankey" 
          sankeyData = {this.state.data} 
        />
      </div>
  );
  } 
  }

  export default App;
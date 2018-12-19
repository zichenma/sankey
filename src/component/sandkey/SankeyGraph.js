import React, { Component, PropTypes } from 'react';
import * as d3 from "d3";
import sankeyModule from "./sankey"
import styles from './sankey.css';
// ideally to make particle part into another component,
// but got some color issue, had to gave up
// it works you uncomment and try it
//import SankeyParticle from '../particle/SankeyParticle';

class SankeyGraph extends Component {
  displayName: 'SankeyGraph';
  
  state = {
    importedData : null
  }

  constructor(props) {
    super(props);
    this.state.importedData = props.sankeyData || null;
  }
  
  PropTypes : {
    id : PropTypes.string,
    colorCategory : PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
    margin_left : PropTypes.number,
    margin_right: PropTypes.number,
    margin_top: PropTypes.number,
    margin_bottom: PropTypes.number,
    nodeWidth : PropTypes.number,
    nodePadding : PropTypes.number,
    sankeyData : PropTypes.object,
  }

  componentDidMount () {
    this.setContext();
  }
  
  setCanvasDim (top, right, bottom, left) {
    document.querySelector('canvas').style.marginTop = `${top}px`;
    document.querySelector('canvas').style.marginRight = `${right}px`;
    document.querySelector('canvas').style.marginBottom = `${bottom}px` ;
    document.querySelector('canvas').style.marginLeft = `${left}px`;
  }

  // testing in Jasmine sample code: 
  // describe('SankeyGraph Canvas size testing', () => {
  //   it('Should keep the same margin size as svg', () => {
  //       setCanvasDim(10,10,10,10);
  //       const canvas_marginTop = document.querySelector('canvas').style.marginTop;
  //       const svg_marginTop =  document.querySelector('svg').style.marginTop;
  //       expect(canvas_marginTop).toEqual(svg_marginTop);
  //   })
  // })

  setColor (colorCategory) {
     const colorCategories = {
        '10'  :  d3.schemeCategory10, 
        '20'  :  d3.schemeCategory20,
        '20b' :  d3.schemeCategory20b,
        '20c' :  d3.schemeCategory20c 
    }
    return  colorCategories[String(colorCategory)] || d3.schemeCategory20;
  }
  // testing in Jasmine sample code: 
  // describe('SankeyGraph color testing', () => {
  //   it ('Should return d3.schemeCategory10', () => {
  //         let result = d3.schemeCategory10;
  //         expect(setColor('10')).toEqual(result);
  //   })
  // })

  validateData (obj) {
    if ((!!obj) && (obj.constructor !== Object)) {
      console.error('input data must be an object!');
      return;
    }
  }
   // testing in Jasmine sample code: 
  //  describe('SankeyGraph data testing', () => {
  //   it ('Should throw invalid data fromat error', () => {
  //        let obj = [];
  //        expect((!!obj) && (obj.constructor !== Object)).toEqual(true);
  //   })
  // })

  setContext() {
    let units = " TWh";
    const { height, width, margin_left, margin_right, 
            margin_top, margin_bottom, id, nodeWidth, 
            nodePadding, colorCategory } = this.props;

    const margin = {top: margin_top, right: margin_right, bottom: margin_bottom, left: margin_left};

    const graph = this.state.importedData;

    this.validateData(graph);

    this.setCanvasDim(
      this.props.margin_top, this.props.margin_right, 
      this.props.margin_bottom, this.props.margin_left
    );

    let formatNumber = d3.format(",.0f"),

    format = (d) => { return formatNumber(d) + units; },
    
    // default color: d3 category20
    color = d3.scaleOrdinal(this.setColor(colorCategory) || d3.schemeCategory20);
    
    let svg = d3.select(this.refs.sankey).append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr('id', id)
                .append('g')
                .attr("transform", 
                    "translate(" + margin.left + "," + margin.top + ")");
                  
    let sankey = sankeyModule(d3)
                  .nodeWidth(nodeWidth)
                  .nodePadding(nodePadding)
                  .size([width, height]);
    
    let path = sankey.link();

    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

    let link = svg.append("g").selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

      link.append("title")
        .text(function(d) {
    		return d.source.name + " → " + 
                d.target.name + "\n" + format(d.value); });
      
      let node = svg.append("g").selectAll(".node")
          .data(graph.nodes)
          .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; })
          .call(d3.drag()
          .subject(function(d) {
              return d;
            })
          .on("start", function() {
              this.parentNode.appendChild(this);
            })
          .on("drag", dragmove));

        node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
        return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
        return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { 
        return d.name + "\n" + format(d.value); });

        node.append("text")
          .attr("x", -6)
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) { return d.name; })
          .filter(function(d) { return d.x < width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");
        
        function dragmove(d) {
          d3.select(this)
            .attr("transform", 
                  "translate(" 
                     + d.x + "," 
                     + (d.y = Math.max(
                        0, Math.min(height - d.dy, d3.event.y))
                       ) + ")");
          sankey.relayout();
          link.attr("d", path);
        }
      
     
      this.setParticle(graph);
  }
  // particle part: 
  setParticle (graph) {
    let freqCounter = 1;
    let linkExtent = d3.extent(graph.links, function (d) {return d.value});
    let frequencyScale = d3.scaleLinear().domain(linkExtent).range([1,100]);
    let particleSize = d3.scaleLinear().domain(linkExtent).range([1,5]);

    graph.links.forEach((link) => {
      link.freq = frequencyScale(link.value);
      link.particleSize = particleSize(link.value);
      link.particleColor = d3.scaleLinear().domain([1,1000]).range([link.source.color, link.target.color]);
    })

    let t = d3.timer(tick, 1000);
    let particles = [];

    function tick(elapsed, time) {

        particles = particles.filter(d => {return d.time > (elapsed - 1000)});

        if (freqCounter > 100) {
          freqCounter = 1;
        }

        d3.selectAll("path.link")
        .each(
          function (d) {
            if (d.freq >= freqCounter) {
              var offset = (Math.random() - .5) * d.dy;
              particles.push({link: d, time: elapsed, offset: offset, path: this})
            }
          });

        particleEdgeCanvasPath(elapsed);
        freqCounter++;

    }

    function particleEdgeCanvasPath(elapsed) {
      var context = d3.select("canvas").node().getContext("2d")
      context.clearRect(0,0,1000,1000);
        context.fillStyle = "gray";
        context.lineWidth = "1px";
      for (var x in particles) {
          var currentTime = elapsed - particles[x].time;
          var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
          var currentPos = particles[x].path.getPointAtLength(currentPercent)
          context.beginPath();
        context.fillStyle = particles[x].link.particleColor(currentTime);
          context.arc(currentPos.x,currentPos.y + particles[x].offset,particles[x].link.particleSize,0,2*Math.PI);
          context.fill();
      }
    }
  }

  render() {
    const { importedData } = this.state;
    if (!importedData) {
      return null;
    }
    return (
      <div ref="sankey">
        <canvas 
        height={this.props.height} 
        width={this.props.width}
        ></canvas>
        {/* <SankeyParticle 
        height={this.props.height} 
        width={this.props.width}
        particleData={importedData}
        /> */}
      </div>
    )
  }
}

export default SankeyGraph;
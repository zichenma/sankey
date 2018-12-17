import React, { Component, PropTypes } from 'react';
import * as d3 from "d3";
import sankeyModule from "./sankey"
import styles from './sankey.css';


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
    nodeWidth : PropTypes.number,
    nodePadding : PropTypes.number,
    sankeyData : PropTypes.object,
    
  }

 
  componentDidMount () {
    this.setContext();
  }

 
  setContext() {
    let units = " TWh";
    const { height, width, id, nodeWidth, nodePadding, colorCategory } = this.props;
    const margin = {top: 1, right: 1, bottom: 6, left: 1};
    const colorCategories = {
        '10'  :  d3.schemeCategory10, 
        '20'  :  d3.schemeCategory20,
        '20b' :  d3.schemeCategory20b,
        '20c' :  d3.schemeCategory20c 
    }
    const colorOptions = colorCategories[colorCategory];
    const graph = this.state.importedData;

    if (graph == null) {
      return;
    }
   
    let formatNumber = d3.format(",.0f"),    
    format = function(d) { return formatNumber(d) + units; },
    color = d3.scaleOrdinal(colorOptions);


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

    let freqCounter = 1;

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

      // particle part: 
      var linkExtent = d3.extent(graph.links, function (d) {return d.value});
      var frequencyScale = d3.scaleLinear().domain(linkExtent).range([1,100]);
      var particleSize = d3.scaleLinear().domain(linkExtent).range([1,5]);


      graph.links.forEach(function (link) {
        link.freq = frequencyScale(link.value);
        link.particleSize = particleSize(link.value);
        link.particleColor = d3.scaleLinear().domain([1,1000]).range([link.source.color, link.target.color]);
      })

      var t = d3.timer(tick, 1000);
      var particles = [];

      function tick(elapsed, time) {

          particles = particles.filter(function (d) {return d.time > (elapsed - 1000)});

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
        <canvas width="1000" height="500" ></canvas>
      </div>
    )
  }
}

export default SankeyGraph;
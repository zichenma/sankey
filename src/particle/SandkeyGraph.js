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
    height: PropTypes.number,
    width: PropTypes.number,
    sankeyData : PropTypes.object,
  }

 
  componentDidMount () {
    this.setContext();
  }

 
  setContext() {
    let units = "Widgets";
    const { height, width, id} = this.props;
    const margin = {top: 100, right: 100, bottom: 100, left: 100};
    let graph = this.state.importedData;

    if (graph == null) {
      return;
    }
    
    let formatNumber = d3.format(",.0f"),    
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scaleOrdinal(d3.schemeCategory20);

    let svg = d3.select(this.refs.sankey).append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr('id', id)
                .append('g')
                .attr("transform", 
                    "translate(" + margin.left + "," + margin.top + ")");

    let sankey = sankeyModule(d3)
                  .nodeWidth(36)
                  .nodePadding(40)
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
  }

  render() {
    const { importedData } = this.state;
    if (!importedData) {
      return null;
    }
    return (
      <div ref="sankey"></div>
    )
  }
}

export default SankeyGraph;
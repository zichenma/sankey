import React, { Component, PropTypes } from 'react';
import * as d3 from "d3";

class SankeyParticle extends Component {
  displayName: 'SankeyParticle';
  
  state = {
    importedData : null
  }

  constructor(props) {
    super(props);
    this.state.importedData = props.particleData || null;
  }
  
  PropTypes : {
    height: PropTypes.number,
    width: PropTypes.number,
    margin_top : PropTypes.number,
    margin_right : PropTypes.number,
    margin_bottom : PropTypes.number,
    margin_left : PropTypes.number,
    particleData: PropTypes.object,
  }

 
  componentDidMount () {
    this.setContext();
  }

 
  setContext() {

    const { height, width, margin_left, margin_right, 
            margin_top, margin_bottom
       } = this.props;

    const graph = this.state.importedData;


    d3.selectAll('canvas')
       .style({'width' : width},
              {'boder' : '1px solid black'})

    if (graph == null) {
      return;
    }

    let freqCounter = 1;

    let linkExtent = d3.extent(graph.links, function (d) {return d.value});

    let  frequencyScale = d3.scaleLinear().domain(linkExtent).range([1,100]);

    let particleSize = d3.scaleLinear().domain(linkExtent).range([1,5]);

    //let link = d3.select('svg').selectAll(".link");

    let canvas = d3.select(this.refs.particle).append('canvas')
    .attr("width", width + margin_left + margin_right)
    .attr("height", height + margin_top + margin_bottom)
    .attr("transform", "translate(" + margin_left + "," + margin_top + ")");


     graph.links.forEach(function (link) {
         link.freq = frequencyScale(link.value);
         link.particleSize = particleSize(link.value);
         link.particleColor = d3.scaleLinear().domain([1,1000]).range([link.source.color, link.target.color]);
     })

    d3.timer(tick, 1000);
    let particles = [];

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
        <div ref="particle"></div>
    )
  }
}

export default SankeyParticle;
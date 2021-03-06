function drawOrbit(_data) {
  var center = {};
  var recenter = false;
  for (var x=0;x<_data.children.length;x++) {
    _data.children[x].size = _data.children[x].children ? _data.children[x].children.length : 0;
  }
  _data.children.sort(function(a,b) {
        if (a.size > b.size) {
          return 1;
        }
        if (a.size < b.size) {
          return -1;
        }
        return 0;
  })
  sizeScale = d3.scale.linear().domain([0,1,5,10,20]).range([4,6,8,10,12]).clamp(true);
  colorScale = d3.scale.linear().domain([0,1,2,3,4]).range(["rgb(161,208,120)","rgb(247,148,72)","rgb(225,203,208)","rgb(174,223,228)","rgb(245,132,102)"]);
  planetColors = {Mercury: "gray", Venus: "#d6bb87", Earth: "#677188", Mars: "#7c5541", Jupiter: "#a36a3e", Saturn: "#e9ba85", Uranus: "#73cbf0", Neptune: "#6383d1"}
  orbit = d3.layout.orbit().size([400,400])
  .revolution(customRevolution)
  .orbitSize(function(d) {return d.depth >= 2 ? 6 : 4})
  .speed(.25)
  .mode([35,36,8,3,1])
  .nodes(_data);
  center = orbit.nodes()[0];
  d3.select("svg")
.append("g")
.attr("class", "viz")
.attr("transform", "translate(50,50)")
  .selectAll("g.node").data(orbit.nodes())
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", function(d) {return "translate(" +d.x +"," + d.y+")"})
  .on("mouseover", nodeOver)
  .on("click", recenter)
  d3.selectAll("g.node")
  .append("circle")
  .attr("class", "satellite")
  .attr("r", function(d) {return sizeScale(d.children ? d.children.length : 0)})
  .style("fill", function(d) {return colorScale(d.depth)})
  .style("stroke", "brown")
  .style("stroke-width", "1px")
  d3.selectAll("g.node").filter(function(d) {return d.depth == 1})
  .append("text")
  .text(function(d) {return d.depth == 0 ? "Sun" : d.key})
  .attr("y", 20)
  .style("text-anchor", "middle")
  d3.select("g.viz")
  .selectAll("circle.ring")
  .data(orbit.orbitalRings())
  .enter()
  .insert("circle", "g")
  .attr("class", "ring")
  .attr("r", function(d) {return d.r})
  .attr("cx", function(d) {return d.x})
  .attr("cy", function(d) {return d.y})
  orbit.on("tick", orbitTick);
  orbit.start();
  function orbitTick() {
    var newX = 200- center.x;
    var newY = 200 - center.y;
    d3.select("g.viz")
    .attr("transform", "scale("+(1 + (center.depth *.1)) +") translate(" + newX + "," + newY + ")")
    d3.selectAll("g.node")
      .attr("transform", function(d) {return "translate(" +d.x +"," + d.y+")"});
    d3.selectAll("circle.ring")
    .attr("cx", function(d) {return d.x})
    .attr("cy", function(d) {return d.y});
        d3.selectAll("line.visible")
        .attr("x1", function(p) {return p.source.x})
        .attr("x2", function(p) {return p.target.x})
        .attr("y1", function(p) {return p.source.y})
        .attr("y2", function(p) {return p.target.y})
  }
  function changeCenter() {
        recenter = false;
        orbit.stop();
    var newX = 200 - center.x;
    var newY = 200 - center.y;
    d3.select("g.viz")
    .transition()
    .duration(1000)
    .attr("transform", "scale("+(1 + (center.depth *.1)) +") translate(" + newX + "," + newY + ")")
    .each("end", function() {orbit.start()})
  }
  function customRevolution(d) 
  {
    if (d.name == "time") {
      return d.depth * .25;
    }
    if (d.name == "geo") {
      return -d.depth * .25;      
    }
    return d.depth
  }
  function nodeOver(d) {
    orbit.stop();
      center = d;
      changeCenter();
      d3.selectAll("text.sat").remove();
      d3.selectAll("line.visible").remove();
      if (d.children) {
        var lines = d.children.map(function(p) {return {source: d, target: p}})
        d3.select("g.viz").selectAll("line.visible")
        .data(lines)
        .enter()
        .insert("line", "g")
        .attr("x1", function(p) {return p.source.x})
        .attr("x2", function(p) {return p.target.x})
        .attr("y1", function(p) {return p.source.y})
        .attr("y2", function(p) {return p.target.y})
        .attr("class", "visible")
        .style("stroke", "rgb(73,106,154)")
        .style("stroke-width", 2)
      }
      if (d.parent) {
        d3.select("g.viz").selectAll("line.fake")
        .data([{source:d, target: d.parent}])
        .enter()
        .insert("line", "g")
        .attr("x1", function(p) {return p.source.x})
        .attr("x2", function(p) {return p.target.x})
        .attr("y1", function(p) {return p.source.y})
        .attr("y2", function(p) {return p.target.y})
        .attr("class", "visible")
        .style("stroke", "rgb(165,127,124)")
        .style("stroke-width", 3)
      }
      d3.selectAll("g.node")
      .filter(function(p) {return p == d || p == d.parent || (d.children ? d.children.indexOf(p) > -1 : false)})
      .append("text")
      .text(function(p) {return p.name})
      .style("text-anchor", "middle")
      .attr("y", 15)
      .attr("class", "sat")
      .style("fill", "none")
      .style("stroke", "white")
      .style("stroke-width", 3)
      .style("stroke-opacity", .7);
      d3.selectAll("g.node")
      .filter(function(p) {return p == d || p == d.parent || (d.children ? d.children.indexOf(p) > -1 : false)})
      .append("text")
      .text(function(p) {return p.name})
      .style("text-anchor", "middle")
      .attr("y", 15)
      .attr("class", "sat");
    d3.selectAll("g.node > circle").style("stroke", "brown").style("stroke-width", 1);    
    d3.select(this).select("circle").style("stroke", "black").style("stroke-width", 3);
  }
}

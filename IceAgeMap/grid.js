
console.log('This is grid.js version 0');
$("#loading").show();

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 21])
    .on("zoom", zoomed);

function zoomed() {
	d3.selectAll(".land").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll(".boundary").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll(".map-point").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	d3.selectAll(".graticule").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  d3.selectAll(".grid").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  d3.selectAll("#bounds").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};


$(document).ready(function(){
  globals.grid = true;
  globals.map = {}
  createMap();
  //loadCSV("/testing-data/sequoia_with_climate.csv");
  loadCSV("/PaleoPortal/testing-data/tsuga_presence.csv");
});

function createMap(){
  	//set the projection parameters
  	globals.map.width = $("#map").width();
  	globals.map.height = $("#map").height();

  	globals.map.projection = d3.geo.mercator()
  	    .scale(100)
  	    .translate([globals.map.width / 2, globals.map.height / 2])
  	    .precision(.1);

  	globals.map.path = d3.geo.path()
  	    .projection(globals.map.projection);

  	globals.map.graticule = d3.geo.graticule();

  	$("#map").empty();
  	//draw the svg canvas
  	globals.map.svg = d3.select("#map").append("svg")
  	    .attr("width", globals.map.width)
  	    .attr("height", globals.map.height);

  	globals.map.svg.call(zoom).call(zoom.event)

  	globals.map.svg.append("path")
  	    .datum(globals.map.graticule)
  	    .attr("class", "graticule")
  	    .attr("d", globals.map.path);

  	d3.json("/PaleoPortal/map-data/world-50m.json", function(error, world){
  			globals.map.svg.insert("path", ".graticule")
  	      .datum(topojson.feature(world, world.objects.land))
  	      .attr("class", "land")
  	      .attr("d", globals.map.path);

  	  globals.map.svg.insert("path", ".graticule")
  	      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
  	      .attr("class", "boundary")
  	      .attr("d", globals.map.path);

          var graticule = d3.geo.graticule();
          globals.map.svg.append("path")
          .datum(graticule)
          .attr("class", "graticule")
          .attr("d", globals.map.path)
          .attr('fill', 'none')
          .attr('stroke-width', 0.25)
          .attr('stroke', 'steelblue').moveToBack();
  	});



}

function loadCSV(filename){
  d3.csv(filename, function(data){
    globals.data = data;
    createGrid(-130, -70, 30, 70, 1);
    fillGrid();
  })
}

function createGrid(xmin, xmax, ymin, ymax, cellSize){
  gridID = 0;
  grid = []
  i = 0
  for (var x = xmin; x < xmax; x += cellSize){
    for (var y = ymin; y<ymax; y+= cellSize){
      cellXmin = x;
      cellYmin = y;
      cellXmax = x + cellSize;
      cellYmax = y + cellSize;
      topLeft = globals.map.projection([cellXmin, cellYmin])
      bottomRight = globals.map.projection([cellXmax, cellYmax])
      height = Math.abs(bottomRight[1] - topLeft[1])
      width = Math.abs(bottomRight[0] - topLeft[0])
      cell = {
        height: height,
        width: width,
        topLeft: topLeft,
        gridID: gridID
      }
      grid.push(cell)
      //give gridIDs to the data
      _.each(globals.data, function(d){
        if ((+d.latitude > cellYmin) && (+d.latitude < cellYmax) && (+d.longitude > cellXmin) && (+d.longitude < cellXmax)){
          d['gridID'] = gridID;
        }
      })
      gridID += 1;
    }
    pct = i / (xmax - xmin) * 100
    i += 1;
  }//end double geo loop

  globals.filteredData = _.filter(globals.data, function(d){
    return ((+d.age > globals.minYear) && (+d.age < globals.maxYear))
  })

  globals.colorScale = d3.scale.linear()
    .domain([0, 25])
    .range(['#3d648d', '#a06428'])

  d3.selectAll(".grid").remove();
  d3.select("#map").select("svg").selectAll(".grid")
    .data(grid)
    .enter()
    .append('rect')
      .attr('class', 'grid')
      .attr('x', function(d){
        return d.topLeft[0]
      })
      .attr('y', function(d){
        return d.topLeft[1]
      })
      .attr('width', function(d){
        return d.width;
      })
      .attr('height', function(d){
        return d.height;
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0.05)
      .on('click', function(d){
        console.log(d.gridID);
      })
}

function fillGrid(){

  d3.select("#map").select("svg")
    .append("rect")
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 1000)
      .attr('width', 1000)
      .style('fill', 'steelblue')
      .attr('class', 'loading')

  globals.filteredData = _.filter(globals.data, function(d){
    return ((+d.age > globals.minYear) && (+d.age < globals.maxYear))
  })
  d3.selectAll(".grid")
    .style('fill', function(d){
      gridID = d.gridID;
      cells = lookupCell(globals.filteredData, gridID)
      if (cells.length != 0 ){
        metric = d3.mean(cells, function(d){return +d.pollenPercentage})
        return globals.colorScale(metric)
      }else{
        return 'none'
      }

    })

  d3.selectAll(".loading").remove();
  $("#loading").hide();
}

function lookupCell(data, cellID){
  o = _.where(data, {gridID: cellID});
  return o
}

function updateGrid(){
  $("#loading").show();
  fillGrid();
}

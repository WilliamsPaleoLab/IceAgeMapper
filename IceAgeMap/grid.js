
console.log('This is grid.js version 0');

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
  CSVToGrid("/testing-data/tsuga_with_climate.csv");
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

  	d3.json("/map-data//world-50m.json", function(error, world){
  			globals.map.svg.insert("path", ".graticule")
  	      .datum(topojson.feature(world, world.objects.land))
  	      .attr("class", "land")
  	      .attr("d", globals.map.path);

  	  globals.map.svg.insert("path", ".graticule")
  	      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
  	      .attr("class", "boundary")
  	      .attr("d", globals.map.path);
  	});
}

function CSVToGrid(filepath){
  d3.csv(filepath, function(data){
    globals.data = data;
    globals.gridData = createGridlayout(data, 1);
    drawGrid(globals.gridData)

    // x1 = globals.map.projection([-130, 70])[0]
    // x2 = globals.map.projection([-70, 0])[1]
    // width = Math.abs(x2 - x1)
    // y1 = globals.map.projection([-70, 0])[1]
    // y2 = globals.map.projection([-130, 70])[1]
    // height = Math.abs(y1 - y2)
    //
    // d3.select("#map").selectAll("svg").append('rect')
    //   .attr('x', x1)
    //   .attr('width', width)
    //   .attr('y', y2)
    //   .attr('height', height)
    //   .attr('fill', 'none')
    //   .style('stroke', 'red')
    //   .attr('id', 'bounds')

  })
}

function createGridlayout(dataset, windowSize){
  gridID = 0
  layout = new Array();
  for (var x = -130; x<-70; x += windowSize){
    for (var y = 0; y<70;y += windowSize){
      points = [];
      xmin = x;
      ymin = y;
      xmax = x + windowSize;
      ymax = y + windowSize
      // console.log(xmin + "/" + xmax)
      // console.log(ymin + "/" + ymax)
      these = _.filter(dataset, function(d){
        return ((+d.longitude < xmax) && (+d.longitude > xmin) && (+d.latitude > ymin) && (+d.latitude < ymax))
      })
      // mean = d3.mean(these, function(d){return d.pollenPercentage});
      // std = d3.deviation(these, function(d){return d.pollenPercentage})
      // min = d3.min(these, function(d){return d.pollenPercentage})
      // max = d3.max(these, function(d){return d.pollenPercentage})
      // median = d3.median(these, function(d){return d.pollenPercentage});
      topLeft = globals.map.projection([xmin, ymin])
      bottomRight = globals.map.projection([xmax, ymax])
      width = Math.abs(topLeft[0] - bottomRight[0])
      height = Math.abs(topLeft[1] - bottomRight[1])

      obj = {height: height,
        width: width,
        topLeft: topLeft,
        points: these,
        ymin: ymin,
        xmin: xmin,
        ymax: ymax,
        xmax: xmax
      }
      layout.push(obj);
      gridID += 1;
    }
  }
  return layout;
}

function drawGrid(gridData){
  globals.colorScale = d3.scale.linear()
    .range(['white', '#420000'])

  if ($('#absolute-display').prop('checked')){
    globals.colorScale.domain([0, 100])
  }else{
    globals.colorScale.domain(d3.extent(values))
  }

  d3.select("#map").select("svg").selectAll(".grid").remove()
  d3.select("#map").select("svg").selectAll(".grid")
    .data(gridData)
    .enter()
    .append('rect')
      .attr('x', function(d){
        return +d.topLeft[0]
      })
      .attr('y', function(d){
        return +d.topLeft[1]
      })
      .attr('height', function(d){
        return +d.height;
      })
      .attr('width', function(d){
        return +d.width;
      })
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.1)
      .attr('class', 'grid')

      updateGrid()

    d3.selectAll(".grid").attr('transform', 'translate(' + zoom.translate()[0] + "," + zoom.translate()[1] + ")scale(" + zoom.scale() + ")")
}

$(".display-select").change(function(){
  updateGrid();
})

function checkData(){
  var withData = 0
  _.map(globals.gridData, function(d){
    points = d.points;
    if (points.length != 0){
      withData +=1;
    }
  })
  console.log("Check data: " + withData)
}

function updateGrid(){
  values = []
  d3.selectAll(".grid")
    .style('fill', function(d){
      var thesePoints = _.filter(d.points, function(point){
        return ((+d.age > globals.minYear) && (+d.age < globals.maxYear))
      })
      var displayVar = $("input[type='radio'][name='variable-select']:checked").val();
      if (displayVar == 'mean'){

      }
    })


}

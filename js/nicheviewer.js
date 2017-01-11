// //controls the creation and manipulation of NicheViewer
function makeNicheViewer(){
  //dimensions so we know if they change later
  globals.nvWidth = $(globals.nvPanel._container).width()
  globals.nvHeight = $(globals.nvPanel._container).height()
  $("#nv-chart").empty()
  //makes the canvas for drawing the chart
  if (globals.openNVPanel){
    globals.nvPanel.open()
  }else{
    globals.nvPanel.close()
  }

  //adds the axes
  console.log("About to make NicheViewer")
  globals.nicheViewer = {}
  globals.nicheViewer.margins = {
    top: 25,
    left: 55,
    right: 25,
    bottom: 40
  }
  globals.nicheViewer.dimensions = {
    height: ($(globals.nvPanel._container).height() - $("#nv-controls").height()) * 0.8 - globals.nicheViewer.margins.top - globals.nicheViewer.margins.bottom, //go with width to make square
    width: $(globals.nvPanel._container).width() * 0.9  - globals.nicheViewer.margins.left - globals.nicheViewer.margins.right,
  }
  globals.nicheViewer.svg = d3.select("#nv-chart").append("svg")
    .attr('height', globals.nicheViewer.dimensions.height + globals.nicheViewer.margins.top + globals.nicheViewer.margins.bottom)
    .attr('width', globals.nicheViewer.dimensions.width + globals.nicheViewer.margins.left + globals.nicheViewer.margins.right)
    .append('g')
      .attr('transform', 'translate(' + globals.nicheViewer.margins.left + "," + globals.nicheViewer.margins.top + ")")
}

function makeNicheHistogram(variableID){
  //gets the niche data and makes a histogram with it
  getNicheData(variableID, makeHistogram)
}
function getNicheData(variableID, callback){
  //gets niche data from the server to make the niche diagram
  host = "http://localhost:10010/data"
  dat = processNeotomaForNDS(variableID, 6)
  console.log(dat)
  $.ajax(host, {
    type: "POST",
    data: JSON.stringify(dat),
    dataType: "json",
    contentType: "application/json",
    error: function(xhr, status, err){
      console.log(xhr.responseText)
    },
    beforeSend: function(){
      console.log("Sending data request.")
    },
    success: function(data){
      console.log("Got niche data")
      globals.nicheData = data
      globals.nicheValues = cleanArray(_.pluck(data, "interp"))
      makeHistogram(globals.nicheValues)
    }
  })
}

function makeHistogram(values){
  $("#nv-chart").empty()

  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 500 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  ext = d3.extent(values)
  console.log(ext)
  var x = d3.scale.linear()
      .domain(ext)
      .range([0, width]);

  // Generate a histogram using twenty uniformly-spaced bins.
  var data = d3.layout.histogram()
      .bins(x.ticks(7))
      (values);

  console.log(data)

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")

  var svg = d3.select("#nv-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = svg.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(data[0].dx) - 1)
      .attr("height", function(d) { return height - y(d.y); });

  // bar.append("text")
  //     .attr("dy", ".75em")
  //     .attr("y", 6)
  //     .attr("x", x(data[0].dx) / 2)
  //     .attr("text-anchor", "middle")
  //     .text(function(d) { return  d.y; });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

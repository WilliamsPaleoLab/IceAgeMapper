globals = {}

console.log("Running script...")

globals.climate = {}

globals.climate.varA = 35
globals.climate.varB = 34
globals.climate.sourceA = 6
globals.climate.sourceB = 6

globals.config = {
  //this holds rules for static configuration of the application
  //variables go in here if they will be consistent from session to session and user to user
  map: {
    primaryTileURL: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', //where to go to get tiles
    maxZoom: 8,
  }, //end map
  layout: {
    margins: {
      south: { //margins for bottom panel chart
        left: 50,
        right: 25,
        top: 0,
        bottom: 50
      }
    },//end margins
  }//end layout
}//end config

globals.state = {//this holds all relevant info to be shared and saved.
  //variables go in here if they might be modified by the user during a session
  layout: { //layout of the page
    westSize: '50%', //initial size of lefthand pane with map
    southSize: '20%', //initial size of bottom pane with timeline
    southChartType: 'temp'
  },
  map: { //map pane
    center:[35, -122],  //geographic center of map
    zoom: 3 //zoom level of map
  },
  time: {
    currentRange: [-Infinity, Infinity]
  }

}



function sizePane (pane, size) {
  //utility function for resizing window panes
  myLayout.sizePane(pane, size);
  myLayout.open(pane); // open pane if not already
};

function createLayout(){
  //create the page layout
  //divide into three panes (east, west, south -- right, left, bottom)
  var toggleButtons	= '<div class="btnCenter"></div>'
            + '<div class="btnBoth"></div>'
            + '<div class="btnWest"></div>';
  // CREATE THE LAYOUT
  globals.pageLayout = $('body').layout({
    resizeWhileDragging: 			false,
    sizable:						false,
    animatePaneSizing:				true,
    fxSpeed:						'slow',
    west__size:						globals.state.layout.westSize,
    spacing_open:					0,
    spacing_closed:					0,
    west__spacing_closed:			8,
    west__spacing_open:				8,
    west__togglerLength_closed:		105,
    west__togglerLength_open:		105,
    west__togglerContent_closed:	toggleButtons,
    west__togglerContent_open:		toggleButtons,
    west__onresize: resizeMapPanel,
    south_onresize: resizeSouthChart,
    south__size: globals.state.layout.southSize
  });

  //make the buttons work to expand/collapse all
  globals.pageLayout.togglers.west
  .unbind("click")
  .find(".btnCenter").click(maximizeCenter).attr("title", "Maximize Center").end()
  .find(".btnWest").click(maximizeWest).attr("title", "Maximize West")	.end()
  .find(".btnBoth").click(equalizePanes).attr("title", "Reset to 50/50").end();

	function maximizeCenter	(evt) { globals.pageLayout.close("west"); evt.stopPropagation(); };
	function maximizeWest	(evt) { globals.pageLayout.sizePane("west", "100%"); globals.pageLayout.open("west"); evt.stopPropagation(); };
	function equalizePanes	(evt) { globals.pageLayout.sizePane("west",  "50%"); globals.pageLayout.open("west"); evt.stopPropagation(); };
}

function createMap(){
  //add a map to the lefthand pane
  globals.map = L.map('map', {zoomControl:false})//leftlet map creation
    .setView(globals.state.map.center, globals.state.map.zoom);

  var tiles = L.tileLayer(globals.config.map.primaryTileURL, {//add map tiles
  	maxZoom: globals.config.map.maxZoom
  }).addTo(globals.map)
}

function resizeMapPanel(){
  //called when lefthand panel is resized
  //correctly resizes the map.
  setTimeout(function(){ globals.map.invalidateSize()}, 10);//this line must happen after panel resize is finished.
  //store in application state so we can share the config later.
  westWidth = globals.pageLayout.panes.center.outerWidth()
  westPct = (westWidth / $("body").width())*100 //convert to percent for different screen sizes
  globals.state.layout.westSize = westPct
}


function initialize(){
  //initialization function to be called on load
  //1.  Create the page layout
  //2. Load the map
  //3. Setup the context for drawing in the bottom panel
  //4. Draw the greenland temperature curve in the bottom panel
  //5. Get taxa names from Neotoma
  //Parse the query string to check for state parameters
  //setup niche-viewer in righthand panel
  processQueryString()
  getEcolGroups()
  createLayout();
  createMap();
  setupSouthSVG();
  drawSouthTempGraph();
  setupEastSVG()
}



function setupSouthSVG(){
  //set up the bottom panel
  //create the SVG of the correct size
  // build the axes for the charts
  globals.southChart = d3.select("#bottom-chart").append('svg') //canvas
  globals.southMargins = {//margins for the bottom chart
    top: globals.config.layout.margins.south.top,
    right: globals.config.layout.margins.south.right,
    bottom: globals.config.layout.margins.south.bottom,
    left: globals.config.layout.margins.south.left}
  //these are internal and don't need to be stored in application state
  globals.southChartWidth = +$("body").width() - globals.southMargins.left - globals.southMargins.right,
  globals.southChartHeight = +globals.pageLayout.panes.south.outerHeight() * 0.9  - globals.southMargins.top - globals.southMargins.bottom,
  globals.southChartContext = globals.southChart.append("g").attr("transform", "translate(" + globals.southMargins.left + "," + globals.southMargins.top + ")");

  //chart axes
  globals.southX = d3.scaleLinear()
      .rangeRound([0, globals.southChartWidth]);

  globals.southY = d3.scaleLinear()
      .rangeRound([globals.southChartHeight, 0]);

  //chart brusher
  globals.southBrush = d3.brushX()
    .extent([[0, 0], [globals.southChartWidth, globals.southChartHeight]])
    .on("brush end", brushed);

  //brush callback function
  //called on brush action
  function brushed() {
    //get the time min/max of the brush
    var s = d3.event.selection;
    if (s == null) {
      globals.currentRange = [-Infinity, Infinity]
    } else {
      globals.currentRange = s.map(globals.southX.invert);//invert the pixel scale to get back years
    }
    globals.state.time.currentRange = globals.currentRange
    if (globals.cfData){
      //do the brushing on the dataset
      globals.dataYearDimension.filterRange(globals.currentRange)
      updateMapPoints()
    }
updateNVPoints()
  }
}

function updateMapPoints(){
  //update the circles on the map
  globals.map.pointsYears.filterRange(globals.currentRange)
  globals.map.removeLayer(globals.map.ptsLayer)
  // globals.map.ptsLayer.addLayer(globals.map.pointsYears)
  filteredMarkers = globals.map.pointsYears.top(Infinity)
  globals.map.ptsLayer = L.layerGroup(filteredMarkers)
  globals.map.addLayer(globals.map.ptsLayer)
}

function updateNVPoints(){
  dots = globals.eastChart.svg.selectAll(".dot")
    .data(globals.climYear.top(Infinity))

    dots.enter().append("svg:g")
      .attr("class", "dot")
      .append("circle")

    dots.transition().duration(500)
    .selectAll("circle")
    .attr("cx", function(d){return d.a})
    .attr("cy", function(d){return d.bug})

    dots.exit().transition().duration(500)
    .selectAll("circle")
    .attr("height", 0)
    .remove();
}

function drawSouthTempGraph(){
  //draw the greenland temperature graph on the south panel chart
  globals.southLineFn = d3.line()
      .x(function(d) { return globals.southX(d.YearsBP); })
      .y(function(d) { return globals.southY(d.TempC); });

  // clear current chart, if exists
  globals.southChartContext.empty()

  d3.csv("data/greenlandT.csv", function(d) {
      //get data (ansyc)
      //convert to numeric on each data point
      d.TempC = +d.TempC;
      d.YearsBP = +d.YearsBP;
      return d;
    },
  function(error, data) {
    //success function
    if (error) throw error;

    //set axes domains
    globals.southX.domain(d3.extent(data, function(d) { return d.YearsBP; }));
    globals.southY.domain(d3.extent(data, function(d) { return d.TempC; }));

    //add x axis
    globals.southChartContext.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + globals.southChartHeight + ")")
        .call(d3.axisBottom(globals.southX));

    //add y axis with label
    globals.southChartContext.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(globals.southY))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style("text-anchor", "end")
        .text("Temperature (C)");

    //add the temperature curve
    globals.southChartContext.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", globals.southLineFn)//interpolator function
        .style('stroke', 'red')
        .style('fill', 'none');

    //enable brushing
    var gBrush = globals.southChartContext.append("g")
            .attr("class", "brush")
            .call(globals.southBrush);

  });

}

function resizeSouthChart(){
  //resizes teh bottom panel and diagrams to the new window size
  $("#bottom-chart").empty();
  setupSouthSVG();
  if (globals.state.layout.southChartType == 'temp'){
      drawSouthTempGraph();
  }
}

function getEcolGroups(){
  //get ecological groups from Neotoma to put into the taxa browser
  $("#ecolGroupSelect").empty()
  endpoint = "http://api.neotomadb.org/v1/dbtables/TaxaGroupTypes"
  $.getJSON(endpoint, function(response){
    console.log(response)
    if(response['success'] != 1){
      alert("Neotoma is not functioning properly.")
    }else{
      data = response['data']
      for (i in data){
        q = data[i]
        html = "<option value='" + q['TaxaGroupID'] + "'>" + q['TaxaGroup'] + "</option>"
        $("#ecolGroupSelect").append(html)
      }
    }
  })
}


function getTaxaInGroup(){
  //get the taxa in the ecological group that's been selected.
  $("#taxonSelect").empty()
  $("#taxonSelect").append("<option>Loading...</option>")
  $("#taxonSelect").prop('disabled', 'disabled')
  status = $(".taxonStatusSelect:checked").val()
   grpid = $('#ecolGroupSelect :selected').val();
   endpoint = "http://api.neotomadb.org/v1/data/taxa?taxagroup=" + grpid + "&status=" + status
   console.log(endpoint)
   $.getJSON(endpoint, function(response){
     $("#taxonSelect").empty()
     $("#taxonSelect").prop('disabled', false)
     if (response['success'] != 1){
       alert("Neotoma is not functioning properly.")
     }else if (response['data'].length == 0){
       $("#taxonSelect").append("<option>No Results Found...</option>")
       $("#taxonSelect").prop('disabled', 'disabled');
     }else{
       $("#taxonSelect").prop('disabled', false);
       data = response['data']
       for (i in data){
         q = data[i]
         html = "<option value='" + q['TaxonID'] + "'>" + q['TaxonName'] + "</option>"
         $("#taxonSelect").append(html)
       }
     }
   })
}

function loadOccurrences(taxonid, callback){
  //load the occurrence data from Neotoma
  endpoint = "http://api.neotomadb.org/v1/data/sampledata?taxonids=" + taxonid
  console.log(endpoint)
  $.getJSON(endpoint, function(response){
    if (response['success'] != 1){
      alert("Failed to load.")
    }else{
      console.log(response['data'].length)
      globals.occurrenceData = response['data']
       processData()
       addPoints()
       getClimateData(globals.occurrenceData)
    }
  })
}

function processData(){
  for (i in globals.occurrenceData ){
    lat = (globals.occurrenceData [i]['SiteLatitudeNorth'] + globals.occurrenceData [i]['SiteLatitudeSouth'])/2
    lng = (globals.occurrenceData [i]['SiteLongitudeWest'] + globals.occurrenceData [i]['SiteLongitudeEast'])/2
    globals.occurrenceData [i]['latitude'] = lat
    globals.occurrenceData[i]['longitude'] = lng
    globals.occurrenceData[i]['age'] = globals.occurrenceData[i]['SampleAge']
    if (globals.occurrenceData[i]['age'] == null){
      globals.occurrenceData[i]['age'] = (globals.occurrenceData[i]['SampleAgeYounger'] + globals.occurrenceData[i]['SampleAgeOlder'])/2
    }
  }

  //prepare data to be crossfiltered.
  globals.cfData = crossfilter(globals.occurrenceData)

  //dimensions to be filtered
  globals.dataValueDimension = globals.cfData.dimension(function(d){return d.Value})
  globals.dataYearDimension = globals.cfData.dimension(function(d){return d.age})

}

function addPoints(){
  pts =  []
  for (i in globals.occurrenceData){
    d = globals.occurrenceData[i]
    m = L.circleMarker([d['latitude'], d['longitude']])
    m.age = d.age
    pts.push(m)
  }
  globals.map.ptsLayer = L.layerGroup(pts)
  globals.map.addLayer( globals.map.ptsLayer)

  globals.map.cfPoints = crossfilter(pts)
  // globals.map.cfPoints = globals.map.cfPoints .group(function(d){return d.DatasetID})
  globals.map.pointsYears = globals.map.cfPoints.dimension(function(d){return d.age})
  console.log("Done adding points")
}




function getClimateData(pts){

  sendPts = []
  for (var i = 0; i < pts.length; i++){
    p = {
      latitude :pts[i]['latitude'],
      longitude : pts[i]['longitude'],
      year : Math.round(pts[i]['age']),
      id : pts[i]['DatasetID']
    }
    sendPts.push(p)
  }



  function getClim(variable, source) {
    payload = {
        "variableID": variable,
         "sourceID": source,
         "points" : sendPts
      }

    payload = JSON.stringify(payload)
    return $.ajax({
        url: "http://grad.geography.wisc.edu:8080/data",
        method: "POST",
        dataType: "json",
        data: payload,
        contentType: "application/json",
        success: function(r){
          console.log("Got climate return")
        },
        beforeSend: function(){
          console.log(payload)
        }
    });
  }

  $.when(getClim(34, 6), getClim(34, 6)).done(mergeClimateData.bind(this));
}

function mergeClimateData(a, b){
  console.log(this)
  mergeResponse = []
  console.log(a)
  console.log(b)
  aData = a[0]['data']
  bData = b[0]['data']
  for (i =0; i<aData.length;i++){
    p = {
      a: aData[i]['value'],
      b: bData[i]['value'],
      year: bData[i]['yearbp'],
      aID: +aData[i]['id'],
      bID: + bData[i]['id']
    }
    mergeResponse.push(p)
  }
  globals.climData = mergeResponse
  globals.climcf = crossfilter(globals.climData)
  globals.climDS = globals.climcf.dimension(function(d){return d.id})
  globals.climYear = globals.climcf.dimension(function(d){return d.year})
  console.log(globals.climData)
  drawClim()
}

function setupEastSVG(){
  globals.eastChart = {}
  globals.eastChart.margin = {top: 20, right: 20, bottom: 30, left: 40}
  globals.eastChart.width = globals.pageLayout.panes.center.outerWidth() - globals.eastChart.margin.left - globals.eastChart.margin.right,
  globals.eastChart.height = globals.pageLayout.panes.center.outerHeight() * 0.5 - globals.eastChart.margin.top - globals.eastChart.margin.bottom;

  globals.eastX = d3.scaleLinear().range([0, globals.eastChart.width]);
  globals.eastY = d3.scaleLinear().range([globals.eastChart.height, 0]);

  globals.eastChart.svg = d3.select("#niche-viewer").append("svg")
    .attr("width", globals.eastChart.width + globals.eastChart.margin.left + globals.eastChart.margin.right)
    .attr("height", globals.eastChart.height + globals.eastChart.margin.top + globals.eastChart.margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + globals.eastChart.margin.left + "," + globals.eastChart.margin.top + ")");
}

function drawClim(){
  globals.eastChart.svg.empty()
  // Scale the range of the data
  globals.eastX.domain(d3.extent(globals.climDS.top(Infinity), function(d) { return d.a; }));
  globals.eastY.domain(d3.extent(globals.climDS.top(Infinity), function(d) { return d.b; }));

  // Add the scatterplot
  globals.eastChart.svg.selectAll("dot")
      .data(globals.climDS.top(Infinity))
    .enter().append("circle")
      .attr("r", 5)
      .attr("cx", function(d) { return globals.eastX(d.a); })
      .attr("cy", function(d) { return globals.eastX(d.b); });

      // Add the X Axis
    globals.eastChart.svg.append("g")
        .attr("transform", "translate(0," + globals.eastChart.height + ")")
        .call(d3.axisBottom(globals.eastX));

    // Add the Y Axis
    globals.eastChart.svg.append("g")
        .call(d3.axisLeft(globals.eastY));
}


function getURLParameterByName(name, url) {
  //get the value of a parameter in the URL string
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function processQueryString(){
  //load values from the query string to configure based on an existing state
  //currently, only taxon searches are supported in the query string parameters
  //TODO: others should be stored in a DB? or queries?
  globals.autoload = false //if this is true, we automatically do the search to neotoma
  taxon = getURLParameterByName('taxon')
  if (taxon){
    globals.taxonid = taxon
    globals.state.taxonid = taxon
    //set the name in the search box
    globals.autoload = true;
  }
  if(globals.autoload){
    loadOccurrences(taxon)
  }
}

function resizeEastChart(){
  $("#niche-viewer").empty()
  setupEastSVG()
  if (globals.climDS != undefined){
      drawClim()
  }
}

/////////////////////////////////
/////////////////////////////////
$(document).ready(function(){
  initialize()
});
/////////////////////////////////
/////////////////////////////////

//Events//
$(window).resize(function(){
  resizeSouthChart();
  resizeEastChart()
})

$("#ecolGroupSelect").change(function(){
  getTaxaInGroup()
})

$(".taxonStatusSelect").change(function(){
  getTaxaInGroup();
})

$("#loadOccurrences").click(function(){
  taxonid =  $('#taxonSelect :selected').val();
  loadOccurrences(taxonid)
})

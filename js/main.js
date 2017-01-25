//this is Ice Age Mapper
//main script
//Version 2.1
//Author: Scott Farley
//University of Wisconsin, Madison

console.log("Welcome to Ice Age Mapper.\n\tRunning script version 2.1.\n\tLead Author: Scott Farley\n\tUniversity of Wisconsin, Madison")

function loadTaxa(callback){
  //loads the taxa file specified in the configuration object
  //runs the callback specified in the arguments
  $.getJSON(globals.config.dataSources.taxa, function(data){
    globals.data.taxa = data
    callback(data)
  })
}

function loadEcolGroups(callback){
  //load the ecological groups from the file specified in the configuration object
  $.getJSON(globals.config.dataSources.ecolGroups, function(data){
    globals.data.ecolGroups = data['data']
    callback(data )
  })
}

function populateEcolGroupDropdown(){
  //populate the ecological groups dropdown menu
  //add a new <option> for each group in the response
  $("#ecolGroupSelect").empty() //clear the list
  for (var i = 0; i < globals.data.ecolGroups.length; i++){
    grp = globals.data.ecolGroups[i]
    html = "<option value='" + grp['EcolGroupID'] + "'>" + grp['EcolGroup'] + "</option>"
    $("#ecolGroupSelect").append(html)
  }
  filterAndPopulateTaxaDropdown(globals.data.ecolGroups[0])
}

function filterAndPopulateTaxaDropdown(toFilter){
  //filter the taxa list
  //put the filtered list into the taxa dropdown
  filteredTaxa = _.filter(globals.data.taxa, function(d){
    return ((d.EcolGroups.indexOf(toFilter) > -1))
  })

  //add an <option> to the dropdown for each of the filtered taxa
  $("#taxonSelect").empty()
  for (var i=0; i < filteredTaxa.length; i++){
    t = filteredTaxa[i]
    html = "<option value='" + t['TaxonID'] + "'>" + t['TaxonName']
    if (t['Extinct']){
      html += "  <span class='text-muted'>(extinct) </span>"
    }
    html += "</option>"
    $("#taxonSelect").append(html)
  }
}

function populateTaxaAutocomplete(){
  //populate the search bar, and make it so it autocompletes when a user starts typing
  //add taxa to the data list first
  taxaNames = _.pluck(globals.data.taxa, "TaxonName")
  input = document.getElementById("taxaAutocomplete")
  globals.elements.taxaAutocomplete = new Awesomplete(input, {
    list: taxaNames,
    minChars: 2,
    filter: Awesomplete.FILTER_STARTSWITH
  })
}

function initialize(){
  //initialization routines
  createLayout()//load the page layout
  loadTaxa(populateTaxaAutocomplete) //load the taxa file
  loadEcolGroups(populateEcolGroupDropdown)//load the ecological groups
  drawNHTempCurve() //draw the greenland ice core record in the bottom panel.
  createMap() //create the map in the center div
  createAnalyticsCharts() //setup visual analytics charts on the righthand panel
  applySavedState() //get the state settings from URL query
}

$(document).ready(function(){
  //called on page load
  initialize()
})


function getOccurrenceData(callback){
  //make an AJAX call to Neotoma API
  //get SampleData for the taxon specified by the user
  //use the name in the search bar (if globals.config.searchSwitch is in search mode)
  //or the id in the selected dropdown option (if the searchSwitch is in browse mode)
  endpoint = globals.config.dataSources.occurrences
  if (globals.config.searchSwitch == "browse"){
    //this is browse mode
    //the user was using the browse dropdowns
    query = "?taxonids=" + globals.taxonid
  }else if(globals.config.searchSwitch == "search"){
    //this is search mode
    //the user was using the search text entry
    //use the text instead of the id to support wildcard characters
    query = "?taxonname=" + globals.taxonname
  }
  endpoint += query
  //limit to bounding box set in configuration object
  endpoint += "&loc=" + globals.config.searchGeoBounds[0] + "," + globals.config.searchGeoBounds[1] + "," + globals.config.searchGeoBounds[2] + "," + globals.config.searchGeoBounds[3]
  //limit to ages set in configuration object
  endpoint += "&ageold=" + globals.config.searchAgeBounds[1]
  endpoint += "&ageyoung="+globals.config.searchAgeBounds[0]
  $.getJSON(endpoint, function(data){
    //on success of Neotoma query
    //check to make sure Neotoma returned okay, often it doesn't
    if (data['success']){
      globals.data.occurrences = data['data']
      toastr.success("Received " + data['data'].length + " occurrences from Neotoma.", "Occurrences Received.")
      callback(null)
    }else{
        toastr.error("Unexpected Neotoma Server Error. It's their fault. Please come back later.", "Server Error")
        callback(error)
    }
  })
}

function processNeotomaData(){
  for (var i=0; i < globals.data.occurrences.length; i++){
     lat = (globals.data.occurrences [i]['SiteLatitudeNorth'] + globals.data.occurrences [i]['SiteLatitudeSouth'])/2
     lng = (globals.data.occurrences[i]['SiteLongitudeWest'] + globals.data.occurrences [i]['SiteLongitudeEast'])/2
     globals.data.occurrences [i]['latitude'] = lat
     globals.data.occurrences[i]['longitude'] = lng
     globals.data.occurrences[i]['age'] = globals.data.occurrences[i]['SampleAge']
     if (globals.data.occurrences[i]['age'] == null){
       globals.data.occurrences[i]['age'] = (globals.data.occurrences[i]['SampleAgeYounger'] + globals.data.occurrences[i]['SampleAgeOlder'])/2
     }
   }

   //prepare data to be crossfiltered.
   globals.filters.occurrences = crossfilter(globals.data.occurrences)

   //dimensions to be filtered
   globals.filters.occurrenceValueDimension = globals.filters.occurrences.dimension(function(d){if (d.VariableUnits == "NISP") {return d.Value}else{return "NA"}})
   globals.filters.occurrenceAgeDimension = globals.filters.occurrences.dimension(function(d){return Math.round(d.age/1000)*1000})
   globals.filters.occurrenceLatitudeDimension = globals.filters.occurrences.dimension(function(d){return Math.round(d.latitude/2)*2})
   globals.filters.occurrenceAltitudeDimension = globals.filters.occurrences.dimension(function(d){return Math.round(d.DatasetMeta.Site.altitude/1000)*1000})
   globals.filters.occurrencePIDimension = globals.filters.occurrences.dimension(function(d){
            if (d.DatasetMeta.DatasetPIs.length != 0){
              return d.DatasetMeta.DatasetPIs[0].ContactName
            }else{
              return "None Listed."
            }})
   globals.filters.occurrenceRecordTypeDimension = globals.filters.occurrences.dimension(function(d){return d.VariableUnits})

   //summarize
   globals.filters.occurrenceLatitudeSummary = globals.filters.occurrenceLatitudeDimension.group().reduceCount()
   globals.filters.occurrenceAltitudeSummary = globals.filters.occurrenceAltitudeDimension.group().reduceCount()
   globals.filters.occurrenceValueSummary = globals.filters.occurrenceValueDimension.group().reduceCount()
   globals.filters.occurrenceAgeSummary = globals.filters.occurrenceAgeDimension.group().reduceCount()
   globals.filters.occurrencePISummary = globals.filters.occurrencePIDimension.group().reduceCount()
   globals.filters.occurrenceRecordTypeSummary = globals.filters.occurrenceRecordTypeDimension.group().reduceCount()

   //callbacks to be completed once data has been processed
   putPointsOnMap() //put circles on map

   //update chart data
   globals.elements.latitudeChart
    .dimension(globals.filters.occurrenceLatitudeDimension)
    .group(globals.filters.occurrenceLatitudeSummary)
    .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.latitude})))


  globals.elements.altitudeChart
     .dimension(globals.filters.occurrenceLatitudeDimension)
     .group(globals.filters.occurrenceLatitudeSummary)
      .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.DatasetMeta.Site.Altitude})))

  globals.elements.ageChart
    .dimension(globals.filters.occurrenceAgeDimension)
    .group(globals.filters.occurrenceAgeSummary)
      .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.age})))

  globals.elements.abundanceChart
    .dimension(globals.filters.occurrenceValueDimension)
    .group(globals.filters.occurrenceValueSummary)
      .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.Value})))

  globals.elements.PIChart
    .dimension(globals.filters.occurrencePIDimension)
    .group(globals.filters.occurrencePISummary)

  globals.elements.recordTypeChart
    .dimension(globals.filters.occurrenceRecordTypeSummary)
    .group(globals.filters.occurrenceRecordTypeSummary)


  // globals.elements.bubble
  //   // .dimension(globals.filters.occurrenceValueDimension)
  //   // .group(globals.filters.occurrenceValueSummary)
  //   // .colors(d3.scale.category10())
  //   // .keyAccessor(function(p){return p.value.latitude})
  //   // .valueAccessor(function(p){
  //   //   console.log(p.value)
  //   //   return p.value.DatasetMeta.Site.Altitude})
  //   // .radiusValueAccessor(function(p){return p.value.Value})
  //   .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.latitude})))
  //   .y(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.DatasetMeta.Site.Altitude})))
  //   .r(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.Value})))
  //   .elasticY(true)
  //   .maxBubbleRelativeSize(0.07)
  //   .renderHorizontalGridLines(true)
  //   .renderVerticalGridLines(true)
  //   .renderLabel(true)
  //   .renderTitle(true)


  redrawAnalytics()
}

function redrawAnalytics(){
  dc.renderAll();
}

function putPointsOnMap(){
  globals.map.removeLayer(globals.map.ptsLayer)
  pts = []
  for (var i=0; i < globals.data.occurrences.length; i++){
    d = globals.data.occurrences[i]
    m = L.circleMarker([d['latitude'], d['longitude']])
    m.age = d.age
    pts.push(m)
  }
  globals.map.ptsLayer = L.layerGroup(pts)
  globals.map.addLayer(globals.map.ptsLayer)

  globals.filters.mapMarkers = crossfilter(pts)
  globals.filters.mapYearDimension = globals.filters.mapMarkers.dimension(function(d){return d.age})
}

function createMap(){
  //load a leaflet map into the map div
  //use the tileset described in the configuration object
  globals.map = L.map('map', {
    zoomControl: false
  }).setView(globals.state.map.center, globals.state.map.zoom);
  L.tileLayer(globals.config.map.primaryTileURL).addTo(globals.map);
  globals.map.ptsLayer = L.layerGroup()
}


//set up the layout
//use the parameters in the configuration object
function createLayout(){
		globals.layout = $('body').layout({
      south: {
        size: globals.config.layout.southPanelSize,
        resizable: globals.config.layout.southPanelResizable,
        initClosed: !globals.state.layout.southPanelIsOpen,
        closable: globals.config.layout.southPanelClosable
      },
      west: {
        size: globals.config.layout.westPanelSize,
        resizable: globals.config.layout.westPanelResizable,
        initClosed: !globals.state.layout.westPanelIsOpen,
        closable: globals.config.layout.westPanelClosable
      },
      east: {
        size: globals.config.layout.eastPanelSize,
        resizable: globals.config.layout.eastPanelResizable,
        initClosed: !globals.state.layout.eastPanelIsOpen,
        closable: globals.config.layout.eastPanelClosable
      }
    });
}

function createAnalyticsCharts(){
  //reset the config
  //TODO: decide if global config or extent is better for x axes


  //initialize DOM elements for analytics charts on the right panel
  globals.elements.latitudeChart = dc.barChart("#latitudeChart")
    .width($("#analyticsContainer").width())
    .height($("#latitudeChart").height())
    // .brushOn(false)
    .elasticY(true)
    .xAxisLabel("Latitude")
    .yAxisLabel("Frequency")

  globals.elements.altitudeChart = dc.barChart("#altitudeChart")
    .width($("#analyticsContainer").width())
    .height($("#altitudeChart").height())
    // .brushOn(false)
    .elasticY(true)
    .xAxisLabel("Altitude (meters)")
    .yAxisLabel("Frequency")

  globals.elements.ageChart = dc.barChart("#ageChart")
      .width($("#analyticsContainer").width())
      .height($("#ageChart").height())
      .margins({bottom: 50, top: 10, left: 40, right: 50})
      // .brushOn(false)
      .elasticY(true)
      .on('renderlet', function (chart) {
                    chart.selectAll("g.x text")
                      .attr('dx', '-30')
                      .attr('transform', "rotate(-45)")
                      .attr('text-anchor','end')
                })
      .xAxisLabel("Age (years BP)")
      .yAxisLabel("Frequency")

  globals.elements.abundanceChart = dc.barChart("#abundanceChart")
      .width($("#analyticsContainer").width())
      .height($("#abundanceChart").height())
      // .brushOn(true)
      .elasticY(true)
      .xAxisLabel("Relative Abundance")
      .yAxisLabel("Frequency")

  globals.elements.PIChart = dc.pieChart("#PIChart")
      .width($("#analyticsContainer").width())
      .height($("#PIChart").height())
      .innerRadius(25)
      .renderLabel(false)


  globals.elements.recordTypeChart = dc.pieChart("#recordTypeChart")
      .width($("#analyticsContainer").width())
      .height($("#PIChart").height())
      .innerRadius(25)
      .slicesCap(17)
      .renderTitle(true)
      .renderLabel(true);

    // globals.elements.bubble = dc.scatterPlot("#alt-lat-bubble")
    //   .width($("#analyticsContainer").width())
    //   .height($("#alt-lat-bubble").height())
    //   .x(d3.scale.linear().domain([globals.config.analytics.latitudeDomainMin,globals.config.analytics.latitudeDomainMax]))
    //   .brushOn(false)
    //   .elasticY(true)
    //   .xAxisLabel("Latitude (&deg;N)")
    //   .yAxisLabel("Altitude (meters)")

}

function getDatasets(callback){
  //this gets dataset metdata
  //useful for some analytics since more is returned, and taxonname/taxonid is a parameter
  endpoint = globals.config.dataSources.datasets
  if (globals.config.searchSwitch == "browse"){
    //this is browse mode
    //the user was using the browse dropdowns
    query = "?taxonids=" + globals.taxonid
  }else if(globals.config.searchSwitch == "search"){
    //this is search mode
    //the user was using the search text entry
    //use the text instead of the id to support wildcard characters
    query = "?taxonname=" + globals.taxonname
  }
  //geoBounds
  endpoint += query + "&loc="+ globals.config.searchGeoBounds[0] + "," + globals.config.searchGeoBounds[1] + "," + globals.config.searchGeoBounds[2] + "," + globals.config.searchGeoBounds[3]
  //limit to ages set in configuration object
  endpoint += "&ageold=" + globals.config.searchAgeBounds[1]
  endpoint += "&ageyoung="+globals.config.searchAgeBounds[0]
  $.getJSON(endpoint, function(data){
    //check neotoma server success
    if (data['success']){
      globals.data.datasetMeta = data['data']
      callback(null)
      toastr.success("Received " + data['data'].length + " datasets from Neotoma.", "Datasets Recevied.")
    }else{
      toastr.error("Unexpected Neotoma Server Error. It's their fault. Please come back later.", "Server Error")
      callback(error)
    }
  })
}

function mergeMeta(){
  for (var i=0; i < globals.data.occurrences.length; i++){
    for (var j=0; j < globals.data.datasetMeta.length; j++){
      occ = globals.data.occurrences[i];
      dat = globals.data.datasetMeta[j];
      datID = dat['DatasetID']
      occID = occ['DatasetID']
      if (datID == occID){
        occ['DatasetMeta'] = dat
        globals.data.occurrences[i] = occ
      }
    }
  }
  processNeotomaData()
}

function applySavedState(){
  //for now, just load the taxa and proceed without having to manually load data
  taxonid = +getParameterByName("taxonid")
  //first check if taxonid is set
  if ((taxonid != undefined ) & (taxonid > 0)){
    globals.taxonid = taxonid
    globals.state.searchSwitch = "browse"
    loadNeotomaData();  //proceed with load
  }else{ //if taxonid isn't set, check for taxonname
    taxonname = getParameterByName("taxonname")
    if ((taxonname  != undefined) && (taxonname != "")){
      globals.taxonname = taxonname
      globals.state.searchSwitch = "search"
      loadNeotomaData();  //proceed with load
    }else{
        toastr.warning("Invalid taxon name in URL query.")
    }
  }
  //otherwise, don't do anything
}

//Events
//on a change of the dropdown, filter the taxa and put them in the next dropdown
$("#ecolGroupSelect").change(function(){
  selectedGrp = $("#ecolGroupSelect :selected").val()
  filterAndPopulateTaxaDropdown(selectedGrp)
  globals.config.searchSwitch = "browse"
})
//toggle the search switch when the user searches with the search bar
//or browses with the dropdowns
$("#taxonSelect").change(function(){
  globals.config.searchSwitch = "browse"
  console.log($("#taxonSelect :selected").val())
})
$("#taxaAutocomplete").on("awesomplete-select", function(){
  globals.config.searchSwitch = "search"
})

//search for Neotoma data when the search button is called
$("#searchButton").click(function(){
  //start search
  globals.taxonname = $("#taxaAutocomplete").val()
  globals.taxonid = $("#taxonSelect :selected").val()
  loadNeotomaData();
})

function loadNeotomaData(){
  //simultaneuous request, but wait for all ajax downloads to be done before trying to merge the data
  globals.requestQ = queue();
  globals.requestQ.defer(getDatasets)
  globals.requestQ.defer(getOccurrenceData)
  globals.requestQ.await(mergeMeta)

  //do loading stuff
  $(".cover").removeClass("cover-full").addClass("cover-half")
  $(".cover").show()

  //set the header bar
  if (globals.state.searchSwitch == "search"){
      $("#taxonid").text("Currently showing results for: " + globals.taxonname)
  }else{
      $("#taxonid").text("Currently showing results for: " + globals.taxonid)
  }

}


function getParameterByName(name, url) {
  //get the query parameter values from the URI
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function drawNHTempCurve(){
    //draws the greenland ice core temperature curve in the bottom panel


  //set up the bottom panel
  //create the SVG of the correct size
  // build the axes for the charts
  globals.southChart = d3.select("#tempContainer").append('svg') //canvas
  globals.southMargins = {//margins for the bottom chart
    top: 25,
    right: 25,
    bottom: 50,
    left: 50
  }
  //these are internal and don't need to be stored in application state
  globals.southChartWidth = +$("#tempContainer").width() - globals.southMargins.left - globals.southMargins.right,
  globals.southChartHeight = +$("#tempContainer").height()   - globals.southMargins.top - globals.southMargins.bottom,
  globals.southChartContext = globals.southChart.append("g").attr("transform", "translate(" + globals.southMargins.left + "," + globals.southMargins.top + ")");

  //chart axes
  globals.southX = d3.scale.linear()
      .range([0, +$("#tempContainer").width() ]);

  globals.southY = d3.scale.linear()
      .range([0, +$("#tempContainer").height() ]);

  // //chart brusher
  // globals.southBrush = d3.brushX()
  //   .extent([[0, 0], [+$("#tempContainer").width(), +$("#tempContainer").height()]])
  //   .on("brush end", brushed);

  //draw the greenland temperature graph on the south panel chart
  southLineFn = d3.svg.line()
      .x(function(d) { return globals.southX(d.YearsBP); })
      .y(function(d) { return globals.southY(d.TempC); });

  //load the data
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

        console.log(data)
        //set axes domains
        globals.southX.domain(d3.extent(data, function(d) { return d.YearsBP; }));
        globals.southY.domain(d3.extent(data, function(d) { return d.TempC; }));

        // Define the axes
        var xAxis = d3.svg.axis().scale(globals.southX)
            .orient("bottom").ticks(5);

        var yAxis = d3.svg.axis().scale(globals.southY)
            .orient("left").ticks(5);


        //add x axis
        globals.southChartContext.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + globals.southChartHeight + ")")
            .call(xAxis);

        //add y axis with label
        globals.southChartContext.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)
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
            .style('fill', 'none')
            .style('stroke-weight', 1)
        //
        // //enable brushing
        // var gBrush = globals.southChartContext.append("g")
        //         .attr("class", "brush")
        //         .call(globals.southBrush);

      }); //end ajax
}

function brushed(){
  console.log("Brushed.")
}


//hide loading screen when load is finished
Pace.on("done", function(){
    $(".cover").fadeOut(2500);
});

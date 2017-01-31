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
  internalID = 0
  for (var i=0; i < globals.data.occurrences.length; i++){
     lat = (globals.data.occurrences [i]['SiteLatitudeNorth'] + globals.data.occurrences [i]['SiteLatitudeSouth'])/2
     lng = (globals.data.occurrences[i]['SiteLongitudeWest'] + globals.data.occurrences [i]['SiteLongitudeEast'])/2
     globals.data.occurrences [i]['latitude'] = lat
     globals.data.occurrences[i]['longitude'] = lng
     globals.data.occurrences[i]['age'] = globals.data.occurrences[i]['SampleAge']
     if (globals.data.occurrences[i]['age'] == null){
       globals.data.occurrences[i]['age'] = (globals.data.occurrences[i]['SampleAgeYounger'] + globals.data.occurrences[i]['SampleAgeOlder'])/2
     }
     globals.data.occurrences[i]._id = internalID
     internalID += 1
   }

   crossFilterData() //prepare data for filtering and plotting with crossfilter library

   //callbacks to be completed once data has been processed
   putPointsOnMap() //put circles on map

   datafyAnalyticsCharts() //update charts with data

  redrawAnalytics()

  // globals.map.on('moveend', function(){
  //   //filter the bubble chart (id dimension)
  //   //on visible map bounds
  //
  //   inBounds = getMarkersInBounds()
  //   globals.elements.bubbleChart.filterAll()
  //   globals.elements.bubbleChart.filter([inBounds])
  //   dc.redrawAll()
  // })
}

function getMarkersInBounds(){
  //returns a list of the internal ids of the markers in the current map view
  bounds = globals.map.getBounds();
  N = bounds._northEast['lat']
  E = bounds._northEast['lng']
  S = bounds._southWest['lat']
  W = bounds._southWest['lng']

  ids = []
  layerList = globals.map.ptsLayer._layers
  for ( i in layerList){
    thisLayer = layerList[i]
    if (isInMapBounds(thisLayer)){
      ids.push(thisLayer._id)
    }
  }
  return ids
}

function crossFilterData(){
  //establish dimensions and groupings of neotoma data for putting into the analytics charts
  //prepare data to be crossfiltered.
  globals.filters.occurrences = crossfilter(globals.data.occurrences)

  //dimensions to be filtered

  //bin by the record type
  //so we can make a pie chart of the different record types
  //facilitates visualization of both mammal and pollen data
  globals.filters.occurrenceValueDimension = globals.filters
        .occurrences
        .dimension(function(d){
          if (d.VariableUnits == "NISP") {
            return d.Value
          }else{
            return 0
        }})

  //bin by age
  globals.filters.occurrenceAgeDimension = globals.filters
        .occurrences
        .dimension(
          function(d){
            return d.age
          })

  //bin by latitude
  globals.filters.occurrenceLatitudeDimension = globals.filters
        .occurrences
        .dimension(function(d){
          return d.latitude
        })
  //bin by altitude
  globals.filters.occurrenceAltitudeDimension = globals.filters
        .occurrences
        .dimension(function(d){
          return d.altitude
        })

  //bin the investigators together
  //filitates sorting by datasetPI
  globals.filters.occurrencePIDimension = globals.filters
      .occurrences
      .dimension(function(d){
        //TODO: Not working.
        if ((d.DatasetMeta.DatasetPIs[0] != undefined)){
          return d.DatasetMeta.DatasetPIs[0].ContactName
        }else{
          return "None Listed"
        }

       })

   //bin and return the geographic information
   globals.filters.occurrenceGeoDimension = globals.filters
       .occurrences
       .dimension(function(d){
         return L.latLng(d.latitude, d.longitude)
        })

  //bin by abundance
  //should return something not a percent for non-percentage data
  //TODO: need to get total field first
  globals.filters.occurrenceRecordTypeDimension = globals.filters
        .occurrences
        .dimension(function(d){
          return d.VariableUnits
        })

  //summarize into groups

  //histogram the latitude bins
  globals.filters.occurrenceLatitudeSummary = globals.filters.occurrenceLatitudeDimension.group(
    function(d){
      x = Math.round(d / globals.config.analytics.latitudeBinSize)* globals.config.analytics.latitudeBinSize
      return x
    }
  ).reduceCount()

  // group altitude bins
  globals.filters.occurrenceAltitudeSummary = globals.filters.occurrenceAltitudeDimension.group(function(d){
    return Math.round(d / globals.config.analytics.altitudeBinSize) * globals.config.analytics.altitudeBinSize
  }).reduceCount()

  //group abundance bins
  globals.filters.occurrenceValueSummary = globals.filters.occurrenceValueDimension.group(function(d){
    return Math.round(d/ globals.config.analytics.abundanceBinSize) * globals.config.analytics.abundanceBinSize
  }).reduceCount()

  //group age bins
  globals.filters.occurrenceAgeSummary = globals.filters.occurrenceAgeDimension.group(function(d){
    return Math.round(d/globals.config.analytics.timeBinSize)*globals.config.analytics.timeBinSize
  }).reduceCount()

  //group PIs
  globals.filters.occurrencePISummary = globals.filters.occurrencePIDimension.group().reduceCount()
  //group record types
  globals.filters.occurrenceRecordTypeSummary = globals.filters.occurrenceRecordTypeDimension.group().reduceCount()

  //create a custom dimension to make the bubble chart work
  globals.filters.idDimension = globals.filters.occurrences.dimension(function(d){return d._id})

  //customize the reduce function to reduce multiple values
  //for the bubble chart, returns
    //altitude(sum, average)
    //latitude(sum, average)
    //age(sum, average)
    //value(sum, average)
    //count
  globals.filters.multiDimension = globals.filters.idDimension.group().reduce(
    //add
    function(p, v){
      ++p.count;
      p.altitude_sum += v.altitude;
      p.altitude_average = p.altitude_sum / p.count;
      p.latitude_sum += v.latitude;
      p.latitude_average = p.latitude_sum / p.count;
      p.age_sum += v.age
      p.age_average = p.age_sum / p.count;
      p.value_sum += v.Value;
      p.value_average = p.value_sum / p.count;
      return p;
    },
    //remove
    function(p, v){
      --p.count;
      p.altitude_sum -= v.altitude;
      p.altitude_average = p.altitude_sum / p.count;
      p.latitude_sum -= v.latitude;
      p.latitude_average = p.latitude_sum / p.count;
      p.age_sum -= v.age
      p.age_average = p.age_sum / p.count;
      p.value_sum -= v.Value;
      p.value_average = p.value_sum / p.count;
      return p;
    },
    //initialize
    function(p, v){
      return {count:0,
        altitude_sum: 0,
        altitude_average:0,
        latitude_sum: 0,
        latitude_average: 0,
        age_sum: 0,
        age_average: 0,
        value_sum: 0,
        value_average: 0}
    }
  )

  //group by geo
  globals.filters.geoSummary = globals.filters.occurrenceGeoDimension.group().reduceCount();
}

genericAverageReduce = {
  add: function(p, v){ //add record
    ++p.count
    p.latitude_sum += v.latitude
    p.latitude = p.latitude / p.count
  },
  remove: function(p, v){//remove record
    --p.count
    p.latitude_sum -= v.latitude
    p.latitude = p.latitude / p.count
  },
  init: function(p, v){
    //initialize group
    return({count: 0, latitude_sum: 0, latitude: 0})
  }
}

function redrawAnalytics(){
  //wrapper function to update charts with new data
  dc.renderAll();
  dc.redrawAll();
}


function datafyAnalyticsCharts(){
  //put new data into the analytics charts
  //  //update chart data
  //  globals.elements.altitudeChart
  //     .dimension(globals.filters.occurrenceAltitudeDimension)
  //     .group(globals.filters.occurrenceAltitudeSummary)
  //      .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.DatasetMeta.Site.Altitude})))
   //

   globals.elements.latitudeChart
    .dimension(globals.filters.occurrenceLatitudeDimension)
    .group(globals.filters.occurrenceLatitudeSummary)
    .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.latitude})))
    .xUnits(function(start, end, xDomain) { return (end - start) / globals.config.analytics.latitudeBinSize; })

  globals.elements.ageChart
    .dimension(globals.filters.occurrenceAgeDimension)
    .group(globals.filters.occurrenceAgeSummary)
    .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.age})))
    .xUnits(function(start, end, xDomain) { return (end - start) / globals.config.analytics.timeBinSize; })

  globals.elements.abundanceChart
    .dimension(globals.filters.occurrenceValueDimension)
    .group(globals.filters.occurrenceValueSummary)
      .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.Value})))
      .xUnits(function(start, end, xDomain) { return (end - start) / globals.config.analytics.abundanceBinSize; })

  globals.elements.PIChart
    .dimension(globals.filters.occurrencePIDimension)
    .group(globals.filters.occurrencePISummary)

  globals.elements.recordTypeChart
    .dimension(globals.filters.occurrenceRecordTypeSummary)
    .group(globals.filters.occurrenceRecordTypeSummary)

  globals.elements.bubbleChart
  .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.latitude})))
  .y(d3.scale.linear().domain([0, d3.max(globals.data.occurrences, function(d){return d.altitude}) + 100]))
  .r(d3.scale.linear().domain(d3.extent([0, 100])))
  .dimension(globals.filters.idDimension)
  .group(globals.filters.multiDimension)

}

function putPointsOnMap(){
  globals.elements.marker = dc_leaflet.markerChart("#map")
    .dimension(globals.filters.occurrenceGeoDimension )
    .group(globals.filters.geoSummary)
    .width($("#map").width())
    .height($("#map").height())
    .center([30,-90])
    .zoom(3)
    .cluster(true)
    // .tiles(globals.config.map.primaryTileURL)
}

function createMap(){
  //load a leaflet map into the map div
  //use the tileset described in the configuration object
  // globals.map = L.map('map', {
  //   zoomControl: false,
  //   maxZoom: globals.config.map.maxZoom
  // }).setView(globals.state.map.center, globals.state.map.zoom);
  // L.tileLayer(globals.config.map.primaryTileURL).addTo(globals.map);
  // globals.map.ptsLayer = L.layerGroup()
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


  // //initialize DOM elements for analytics charts on the right panel
  // globals.elements.3Chart = dc.barChart("#altitudeChart")
  //   .width($("#analyticsContainer").width())
  //   .height($("#altitudeChart").height())
  //   // .brushOn(false)
  //   .elasticY(true)
  //   .xAxisLabel("Altitude (meters)")
  //   .yAxisLabel("Frequency")


  globals.elements.latitudeChart = dc.barChart("#latitudeChart")
    .width($("#latitudeChart").width())
    .height($("#latitudeChart").height())
    // .brushOn(false)
    .elasticY(true)
    .xAxisLabel("Latitude")
    .yAxisLabel("Frequency")
    .on('filtered', filterMap)
  globals.elements.ageChart = dc.barChart("#ageChart")
      .width($("#ageChart").width())
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
      .on('filtered', filterMap)

  globals.elements.abundanceChart = dc.barChart("#abundanceChart")
      .width($("#abundanceChart").width())
      .height($("#abundanceChart").height())
      // .brushOn(true)
      .elasticY(true)
      .xAxisLabel("Relative Abundance")
      .yAxisLabel("Frequency")
      .on('filtered', filterMap)

  globals.elements.PIChart = dc.pieChart("#PIChart")
      .width($("#PIChart").width())
      .height($("#PIChart").height())
      .innerRadius(25)
      .renderLabel(false)
      .on('filtered', filterMap)


  globals.elements.recordTypeChart = dc.pieChart("#recordTypeChart")
      .width($("#PIChart").width())
      .height($("#PIChart").height())
      .innerRadius(25)
      .slicesCap(17)
      .renderTitle(true)
      .renderLabel(false);


  //color scale for bubble chart ages
  var colorScale = d3.scale.linear()
  .domain([0, globals.config.analytics.timeDomainMax])
  .range([globals.config.analytics.colorYoung,globals.config.analytics.colorOld ])


  globals.elements.bubbleChart = dc.bubbleChart("#alt-lat-Chart")
    .width($("#alt-lat-Chart").width())
    .height($("#alt-lat-Chart").height())
    .margins({top: 25, right: 50, bottom: 30, left: 40})
    .colors(colorScale)
    // .brushOn(true)
    .keyAccessor(function (p) {
        return p.value.latitude_average;
    })
    .valueAccessor(function (p) {
        return p.value.altitude_average;
    })
    .radiusValueAccessor(function (p) {
        return p.value.count;
    })
    .colorAccessor(function (p) {
        return p.value.age_average;
    })
    // .elasticY(true)
    .yAxisPadding(10)
    .xAxisPadding(10)
    .label(function (p) {
        return p.key;
        })

    .renderTitle(true)
    .renderLabel(false)
    .xAxisLabel("Latitude")
    .yAxisLabel("Altitude")
    .on('filtered', filterMap)
}


function filterMap(){
  //get the filter values
  // bubbleFilter = [globals.elements.bubbleChart.filter()];
  //
  // if (bubbleFilter[0] == null){
  //   console.log("hellow")
  //   newLayers = globals.map.allPoints
  // }else{
  //   layerList = globals.map.ptsLayer._layers
  //   newLayers = []
  //   for ( i in layerList){
  //     thisLayer = layerList[i]
  //     thisID = thisLayer._id
  //     if (bubbleFilter.indexOf(thisID) > -1){
  //       newLayers.push(thisLayer)
  //     }
  //   }
  // }//end else
  // globals.map.removeLayer(globals.map.ptsLayer)
  // globals.map.ptsLayer = L.layerGroup(newLayers).addTo(globals.map)
  console.log("Passing function.")
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
        if (+dat.Site.Altitude > -1){
          globals.data.occurrences[i].altitude = +dat.Site.Altitude
        }else{
          globals.data.occurrences[i].altitude = 0 //TODO: remove?
        }
      }
    }
  }
  if (globals.data.occurrences.length != 0){
      processNeotomaData()
  }else{
      toastr.warning("No records were found. Please try another search.", "No Data!")
  }
}

function applySavedState(){
  //for now, just load the taxa and proceed without having to manually load data
  taxonid = +getParameterByName("taxonid")
  //first check if taxonid is set
  if ((taxonid != undefined ) & (taxonid > 0)){
    globals.taxonid = taxonid
    globals.state.searchSwitch = "browse"
    loadNeotomaData();  //proceed with load
    return
  }
  taxonname = getParameterByName("taxonname")
  if ((taxonname != undefined) && (taxonname != "")){
    globals.taxonname = taxonname
    globals.state.searchSwitch = "search"
    loadNeotomaData();  //proceed with load
    return
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


if (globals.map != undefined){
  setTimeout(function(){ globals.map.invalidateSize()}, 10);
}


//is a layer in the map bounds?
function isInMapBounds(marker){
  return globals.map.getBounds().contains(marker.getLatLng());
}

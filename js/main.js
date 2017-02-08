//this is Ice Age Mapper
//main script
//Version 2.1
//Author: Scott Farley
//University of Wisconsin, Madison

//TODO: Navigation on panels
//TODO: Taxonomy linking
//TODO: Table of samples
//TODO: Share state

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
  createMap() //create the map in the center div
  enableMapViewLogging() //put an event listener on the map view
  setMapView() //set the view to whatever is in the state configuration
  createAnalyticsCharts() //setup visual analytics charts on the righthand panel
  // autoLoadOccs() //get the state settings from URL query
  drawNHTempCurve() //draw the greenland ice core record in the bottom panel.
}

function setMapView(){
  globals.map.setView(globals.state.map.center, globals.state.map.zoom)
}

function enableMapViewLogging(){
  globals.map.on('moveend', function(){
    ///update map component of state
    var center = globals.map.getCenter()
    var zoom = globals.map.getZoom()
    globals.state.map.center = center
    globals.state.map.zoom = zoom
  })
}




function getOccurrenceData(callback){
  //make an AJAX call to Neotoma API
  //get SampleData for the taxon specified by the user
  //use the name in the search bar (if globals.config.searchSwitch is in search mode)
  //or the id in the selected dropdown option (if the searchSwitch is in browse mode)
  endpoint = globals.config.dataSources.occurrences
  if (globals.config.searchSwitch == "browse"){
    //this is browse mode
    //the user was using the browse dropdowns
    query = "?taxonids=" + globals.state.taxonid
    globals.state.taxonsearch = globals.state.taxonid
  }else if(globals.config.searchSwitch == "search"){
    //this is search mode
    //the user was using the search text entry
    //use the text instead of the id to support wildcard characters
    query = "?taxonname=" + globals.state.taxonname
    globals.state.taxonsearch = globals.state.taxonname
  }
  endpoint += query
  //limit to bounding box set in configuration object
  endpoint += "&loc=" + globals.config.searchGeoBounds[0] + "," + globals.config.searchGeoBounds[1] + "," + globals.config.searchGeoBounds[2] + "," + globals.config.searchGeoBounds[3]
  //limit to ages set in configuration object
  endpoint += "&ageold=" + globals.config.searchAgeBounds[1]
  endpoint += "&ageyoung="+globals.config.searchAgeBounds[0]
  console.log(endpoint)
  Pace.restart()
  $.getJSON(endpoint, function(data){
    //on success of Neotoma query
    //check to make sure Neotoma returned okay, often it doesn't
    if (data['success']){
      globals.data.occurrences = data['data']
      toastr.success("Received " + data['data'].length + " occurrences from Neotoma.", "Occurrences Received.")
      callback(null)
    }else{
        toastr.error("Unexpected Neotoma Server Error. It's their fault. Please come back later.", "Server Error")
        console.log(data)
        callback(null)
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
     globals.data.occurrences[i].siteid = globals.data.occurrences[i].DatasetMeta.Site.SiteID
     internalID += 1
   }

   globals.state.map.currentRMax = 100;

   crossFilterData() //prepare data for filtering and plotting with crossfilter library

   //callbacks to be completed once data has been processed

   datafyAnalyticsCharts() //update charts with data

  putPointsOnMap() //put circles on map



  redrawAnalytics()

  //apply filters, if they're in the configuration object
  didRedraw = applyFilters()

  globals.state.doSearch = true

  //open the site panel if required by config
  doOpenSitePanel()
}

function crossFilterData(){
  //establish dimensions and groupings of neotoma data for putting into the analytics charts
  //prepare data to be crossfiltered.

  //dimensions to be filtered
  globals.filters.occurrences = crossfilter(globals.data.occurrences)

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
            return d.age / 1000
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
         return L.latLng(d.latitude, d.longitude, d.DatasetMeta.Site.SiteID)
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
  globals.filters.idDimension = globals.filters.occurrences.dimension(function(d){
    return d._id
  })

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
      // p.age_sum += v.age
      // p.age_average = p.age_sum / p.count;
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
      // p.age_sum -= v.age
      // p.age_average = p.age_sum / p.count;
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
        // age_sum: 0,
        // age_average: 0,
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
   globals.elements.latitudeChart
    .dimension(globals.filters.occurrenceLatitudeDimension)
    .group(globals.filters.occurrenceLatitudeSummary)
    .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.latitude})))
    .xUnits(function(start, end, xDomain) { return (end - start) / globals.config.analytics.latitudeBinSize; })

  globals.elements.ageChart
    .dimension(globals.filters.occurrenceAgeDimension)
    .group(globals.filters.occurrenceAgeSummary)
    .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.age / 1000})))
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
    .dimension(globals.filters.occurrenceRecordTypeDimension)
    .group(globals.filters.occurrenceRecordTypeSummary)

  globals.elements.bubbleChart
  .x(d3.scale.linear().domain(d3.extent(globals.data.occurrences, function(d){return d.latitude})))
  .y(d3.scale.linear().domain([0, d3.max(globals.data.occurrences, function(d){return d.altitude}) + 100]))
  // .r(d3.scale.linear().domain([0, 100]).range([0, 50]))
  .dimension(globals.filters.idDimension)
  .group(globals.filters.multiDimension)

  globals.elements.tChart
    .dimension(globals.filters.occurrenceAgeDimension)
    .group(globals.filters.occurrenceAgeSummary)
    // .colors(globals.config.colors.tempAgeHist)
    .brushOn(true)

}

function putPointsOnMap(){
  //put symbols on the map
  globals.elements.marker
    .dimension(globals.filters.occurrenceGeoDimension )
    .group(globals.filters.geoSummary)
    .center([30,-90])
    .zoom(3)
}

function createMap(){
  //load a leaflet map into the map div

  //create a fake dataset to put on the map before the user selects data from Neotoma
  globals.filters.empty = crossfilter()
  globals.filters.emptyDimension = globals.filters.empty.dimension(function(d){return d})
  globals.filters.emptyGroup = globals.filters.emptyDimension.group().reduceCount()

  globals.elements.marker = dc_leaflet.markerChart("#map")
    .width($("#map").width())
    .height($("#map").height())
    .dimension(globals.filters.emptyDimension)
    .group(globals.filters.emptyGroup)
    .center([30,-90])
    .zoom(3)


  //render a blank map on initialization
  globals.elements.marker._doRender()
}



function createLayout(){
  //set up the layout
  //use the parameters in the configuration object
		globals.layout = $('body').layout({

      south: {
        size: globals.config.layout.southPanelSize,
        resizable: globals.config.layout.southPanelResizable,
        initClosed: !globals.state.layout.southPanelIsOpen,
        closable: globals.config.layout.southPanelClosable,
        onresize: function(){
          updateMapSize()
        },
        onclose: function(){
          updateMapSize()
          globals.state.layout.southPanelIsOpen = false
        },
        onopen: function(){
          globals.state.layout.southPanelIsOpen = true
        },
        togglerLength_open:    50,
        togglerLength_closed:  50,
        togglerContent_open:  "<button class='toggleButton'>Close</button>",
        togglerContent_closed: "Timeline"
      },
      west: {
        size: globals.config.layout.westPanelSize,
        resizable: globals.config.layout.westPanelResizable,
        initClosed: !globals.state.layout.westPanelIsOpen,
        closable: globals.config.layout.westPanelClosable,
        onresize: function(){
          updateMapSize()
        },
        onclose: function(){
          updateMapSize()
          globals.state.layout.westPanelIsOpen = false
          globals.state.openSite = false;
        },
        onopen: function(){
          globals.state.layout.westPanelIsOpen = true
        },
        togglerLength_open:    50,
        togglerLength_closed:  50,
        togglerContent_open:   'Close Panel',
        togglerContent_closed: 'Site Details'
      },
      east: {
        size: globals.config.layout.eastPanelSize,
        resizable: globals.config.layout.eastPanelResizable,
        initClosed: !globals.state.layout.eastPanelIsOpen,
        closable: globals.config.layout.eastPanelClosable,
        onresize: function(){
          updateMapSize()
        },
        onclose: function(){
          updateMapSize()
          globals.state.layout.eastPanelIsOpen = false
        },
        onopen: function(){
          globals.state.layout.eastPanelIsOpen = true
        },
        togglerLength_open:    50,
        togglerLength_closed:  50,
        togglerContent_open:   'Close Panel',
        togglerContent_closed: 'Analytics'
      }
    });
}

function updateMapSize(){
  //re-render the map when panel size changes
  if (globals.map != undefined){
    setTimeout(function(){ globals.map.invalidateSize()}, 10);
  }
}

$(window).on('resize', updateMapSize)


function createAnalyticsCharts(){
  //build the axes for the dashboard, without the data -- for now
  //TODO: decide if global config or extent is better for x axes

  globals.elements.latitudeChart = dc.barChart("#latitudeChart")
    .width($("#latitudeChart").width())
    .height($("#latitudeChart").height())
    .margins({bottom: 30, top: 10, left: 30, right: 25})
    // .brushOn(false)
    .elasticY(true)
    .xAxisLabel("Latitude")
    .yAxisLabel("Frequency")
    .on('filtered', function(chart, filter){
        globals.state.filters.latitude = filter
    })

  globals.elements.ageChart = dc.barChart("#ageChart")
      .width($("#ageChart").width())
      .height($("#ageChart").height())
      .margins({bottom: 30, top: 10, left: 30, right: 25})
      // .brushOn(false)
      .elasticY(true)
      // .on('renderlet', function (chart) {
      //               chart.selectAll("g.x text")
      //                 .attr('dx', '-30')
      //                 .attr('transform', "rotate(-45)")
      //                 .attr('text-anchor','end')
      //           })
      .xAxisLabel("kya")
      .yAxisLabel("Frequency")
      .on('filtered', function(chart, filter){
          globals.state.filters.age = filter
      })

  globals.elements.abundanceChart = dc.barChart("#abundanceChart")
      .width($("#abundanceChart").width())
      .height($("#abundanceChart").height())
      .margins({bottom: 30, top: 10, left: 30, right: 10})
      // .brushOn(true)
      .elasticY(true)
      .xAxisLabel("Relative Abundance")
      .yAxisLabel("Frequency")
      .on('filtered', function(chart, filter){
          globals.state.filters.abundance = filter
      })

  globals.elements.PIChart = dc.pieChart("#PIChart")
      .width($("#PIChart").width())
      .height($("#PIChart").height())
      .innerRadius(25)
      .renderLabel(false)
      .on('filtered', function(chart, filter){
          globals.state.filters.PI = filter
      })


  globals.elements.recordTypeChart = dc.pieChart("#recordTypeChart")
      .width($("#recordTypeChart").width())
      .height($("#recordTypeChart").height())
      .innerRadius(25)
      .slicesCap(17)
      .renderTitle(true)
      .renderLabel(false)
      .on('filtered', function(chart, filter){
          globals.state.filters.recordType = filter
      })

  //radius scale for bubble chart
  rScale = d3.scale.linear()
    .domain([0, 150])
    .range([0, 25])


  globals.elements.bubbleChart = dc.bubbleChart("#alt-lat-Chart")
    .width($("#alt-lat-Chart").width())
    .height($("#alt-lat-Chart").height())
    .margins({top: 20, right: 10, bottom: 30, left: 40})
    .colors('rgba(167, 167, 167, 0.25)')
    // .brushOn(true)
    .keyAccessor(function (p) {
        return p.value.latitude_average;
    })
    .valueAccessor(function (p) {
        return p.value.altitude_average;
    })
    .radiusValueAccessor(function (p) {
      v = rScale(p.value.value_average)
        return v;
    })
    // .colorAccessor(function (p) {
    //     return p.value.age_average;
    // })
    .elasticY(true)
    .yAxisPadding(10)
    .xAxisPadding(10)
    .label(function (p) {
        return p.key;
        })
    .renderTitle(true)
    .renderLabel(false)
    .xAxisLabel("Latitude")
    .yAxisLabel("Altitude")
    .on('filtered', function(chart, filter){
        globals.state.filters.singleSite = filter
    })
}


function filterMap(){
  console.log("Passing function.")
}

function getDatasets(callback){
  //this gets dataset metdata
  //useful for some analytics since more is returned, and taxonname/taxonid is a parameter
  endpoint = globals.config.dataSources.datasets
  if (globals.config.searchSwitch == "browse"){
    //this is browse mode
    //the user was using the browse dropdowns
    query = "?taxonids=" + globals.state.taxonid
  }else if(globals.config.searchSwitch == "search"){
    //this is search mode
    //the user was using the search text entry
    //use the text instead of the id to support wildcard characters
    query = "?taxonname=" + globals.state.taxonname
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
      $("#taxonid").text("Currently showing results for: " + globals.state.taxonname)
  }else{
      $("#taxonid").text("Currently showing results for: " + globals.state.taxonid)
  }

}


function drawNHTempCurve(){
    //draws the greenland ice core temperature curve in the bottom panel
    d3.csv("data/greenlandT.csv", function(data){
      globals.data.tempDat = data
      globals.elements.tChart = dc.barChart("#tempContainer")
        .width($("#tempContainer").width())
        .height($("#tempContainer").height())
        .x(d3.scale.linear().domain([0,22]))
        .margins({bottom:30,left:50,right:10,top:10})
        .y(d3.scale.linear().domain(d3.extent(data, function(d){return +d.TempC})))
        .brushOn(false)
        .yAxisLabel("Mean Temperature", 25)
        .xAxisLabel("Thousands of Years Ago")
        .dimension(globals.filters.emptyDimension)
        .group(globals.filters.emptyGroup)
        .on('filtered', function(chart, filter){
          globals.state.filters.age = filter
        })
        .on('renderlet', function(chart) {
              globals.tempLineFn = d3.svg.line()
                  .x(function(d) { return chart.x()(+d.Age); })
                  .y(function(d) { return chart.y()(+d.TempC); })
                  //get drawing context
                  var chartBody = chart.select('g.chart-body');
                  var path = chartBody.selectAll('path').data([data]);
                  path.enter()
                    .append('path')
                    .attr('d', globals.tempLineFn )
                    .style('fill', 'none')
                    .style('stroke',globals.config.colors.tempCurve)
        // add annotations
        if (globals.config.doAnnotations){
          chartBody.selectAll("text").remove()
          chartBody.append('text')
            .attr('x', chart.x()(18))
            .attr('y', chart.y()(-40))
            .attr('text-anchor', 'middle')
            .text("Deglaciation")
            .style('fill', globals.config.colors.annotations)

            chartBody.append('text')
              .attr('x', chart.x()(14.7))
              .attr('y', chart.y()(-31.7))
              .attr('text-anchor', 'middle')
              .text("Bolling Allerod")
              .style('fill', globals.config.colors.annotations)

              chartBody.append('text')
                .attr('x', chart.x()(8))
                .attr('y', chart.y()(-40))
                .attr('text-anchor', 'end')
                .text("The Holocene")
                .style('fill', globals.config.colors.annotations)

            chartBody.append('text')
              .attr('x', chart.x()(0))
              .attr('y', chart.y()(-34))
              .attr('text-anchor', 'begin')
              .text("Today")
              .style('fill', globals.config.colors.annotations)
        }

      }); //end renderlet function

      globals.elements.tChart.render()
    })
}

function lookupSite(siteID){
  //pick out the site meta from occurrences with a certain siteID
  site = _.find(globals.data.occurrences, function(d){return d.siteid == siteID})
  return site.DatasetMeta.Site
}

function lookupSamples(siteID){
  samples =_.filter(globals.data.occurrences, {siteid : siteID})
  return samples
}


function openSiteDetails(siteID){
  //open details about the clicked site
  //called from the map popups

    //here's the site
  globals.state.activeSite = lookupSite(siteID)
  globals.state.activeSiteID = siteID
  globals.state.openSite = true;

  $("#taxonName").text(globals.taxonname)

    globals.layout.open("west") //open the panel

  // //fitst, set map center on this, so it doesn't go out of bounds
  // globals.map.setView(L.latLng((globals.state.activeSite.LatitudeNorth + globals.state.activeSite.LatitudeSouth) / 2, (globals.state.activeSite.LongitudeWest + globals.state.activeSite.LongitudeEast)/2))

  $("#siteName").text(globals.state.activeSite.SiteName)

  $("#siteAltitude").text(globals.state.activeSite.Altitude + "m")

  $("#siteDescription").text(globals.state.activeSite.SiteDescription)

  $("#siteNotes").text(globals.state.activeSite.SiteNotes)

  theseSamples = lookupSamples(siteID)

  $("#sampleTable").empty();

  table = "<thead><th>Age</th><th>Value</th><th>Units</th></thead>"

  for (var i=0; i < theseSamples.length; i++){
    thisSample = theseSamples[i]
    table +=  "<tr><td>" + thisSample.age + "</td><td>" + thisSample.Value + "</td><td>" + thisSample.VariableUnits + "</td></tr>"
    console.log(thisSample.DatasetID)
  }
    $("#sampleTable").html(table)


    //all sites only have one dataset (in this model)
    //but some datasets have multiple listed PIs (some have none)
    piTable = ""
    for (var i = 0; i < theseSamples[0].DatasetMeta.DatasetPIs.length; i++){
        thisSitePI = theseSamples[0].DatasetMeta.DatasetPIs[i]
        piTable += "<tr><td>Dataset Investigator: </td><td>" + thisSitePI.ContactName + "</td><tr>"
    }
    if (piTable == ""){
      piTable = "<i>No Investigators Listed</i>"
    }
    $("#pi-table").html(piTable)

}

function sendShareRequest(){
  //post the share request to the server
  //return the shareid
  dat = {
    config: globals.config,
    state: globals.state
  }
  datString = JSON.stringify(dat)


  //send the request
  $.ajax(globals.config.dataSources.configStore, {
    beforeSend: function(){
      console.log("Sharing your map.")
    },
    type: "POST",
    data: datString,
    dataType: "json",
    contentType: "application/json",
    success: function(data){
      console.log("Success!")
      if (data.success){
        toastr.success("Configuration Storage Complete!")
        hash = data['configHash']
        urlString = globals.config.baseURL +"?shareToken="+ hash
        globals.state.shareURL = hash
        $("#shareURL").html("<a href='" + urlString + "'>" + hash + "</a>")
      }else{
        toastr.error("Failed to share map.")
      }
    },
    error: function(xhr, status,err){
      console.log(xhr)
      console.log(status)
      console.log(err)
    }
  })
}

$("#sendShareRequest").click(sendShareRequest)

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
  globals.state.taxonname = $("#taxaAutocomplete").val()
  globals.state.taxonid = $("#taxonSelect :selected").val()
  loadNeotomaData();
})



//hide loading screen when load is finished
Pace.on("done", function(){
    $(".cover").fadeOut(2500);
});


function applyFilters(){
  //returns whether or not we redraw all the charts
  //true -- did the redraw
  //false -- didn't do the redraw

  //only trigger redraw if we need it
  var _needsUpdate = false

  //filter the age charts -- timeline and analytics
  if ((globals.state.filters.age != null) && (globals.state.filters.age != undefined)){
    globals.elements.tChart.filter(globals.state.filters.age);
    globals.elements.ageChart.filter(globals.state.filters.age);
    _needsUpdate = true;
  }

  //latitude chart
  if ((globals.state.filters.latitude != null) && (globals.state.filters.latitude != undefined)){
    globals.elements.latitudeChart.filter(globals.state.filters.latitude);
    _needsUpdate = true;
  }

  //abundanceChart
  if ((globals.state.filters.abundance != null) && (globals.state.filters.abundance != undefined)){
    globals.elements.abundanceChart.filter(globals.state.filters.abundance);
    _needsUpdate = true;
  }


  //bubbleChart
  if ((globals.state.filters.singleSite != null) && (globals.state.filters.singleSite != undefined)){
    globals.elements.bubbleChart.filter(globals.state.filters.singleSite);
    _needsUpdate = true;
  }

  //bubbleChart
  if ((globals.state.filters.investigator != null) && (globals.state.filters.investigator != undefined)){
    globals.elements.PIChart.filter(globals.state.filters.investigator);
    _needsUpdate = true;
  }

  //bubbleChart
  if ((globals.state.filters.recordType != null) && (globals.state.filters.recordType != undefined)){
    globals.elements.recordTypeChart.filter(globals.state.filters.recordType);
    _needsUpdate = true;
  }

  if(_needsUpdate){
    console.log("Rendering with one or more active filters")
      dc.renderAll();
  }

  return _needsUpdate
}


function doOpenSitePanel(){
  if ((globals.state.openSite) && (+globals.state.activeSiteID > 0)){
    //populate the site panel details
    openSiteDetails(globals.state.activeSiteID)

    //open the correct popup
    globals.map.eachLayer(function(d){
      if (d.key != undefined){
        if (d.key.alt == globals.state.activeSiteID){
          d.openPopup()
        }
      }
    })
  }
}

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
  createMap() //create the map in the center div
  createAnalyticsCharts() //setup visual analytics charts on the righthand panel
}

$(document).ready(function(){
  //called on page load
  initialize()
})


function getOccurrenceData(){
  //make an AJAX call to Neotoma API
  //get SampleData for the taxon specified by the user
  //use the name in the search bar (if globals.config.searchSwitch is in search mode)
  //or the id in the selected dropdown option (if the searchSwitch is in browse mode)
  endpoint = globals.config.dataSources.occurrences
  if (globals.config.searchSwitch == "browse"){
    //this is browse mode
    //the user was using the browse dropdowns
    taxonid = $("#taxonSelect :selected").val()
    query = "?taxonids=" + taxonid
  }else if(globals.config.searchSwitch == "search"){
    //this is search mode
    //the user was using the search text entry
    //use the text instead of the id to support wildcard characters
    taxonname = $("#taxaAutocomplete").val()
    query = "?taxonname=" + taxonname
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
      processOccurrences()
    }
  })
}

function processOccurrences(){
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
   globals.filters.occurrenceValueDimension = globals.filters.occurrences.dimension(function(d){return d.Value})
   globals.filters.occurrenceYearDimension = globals.filters.occurrences.dimension(function(d){return d.age})
   globals.filters.occurrenceLatitudeDimension = globals.filters.occurrences.dimension(function(d){return d.latitude})

   //summarize
   globals.filters.occurrenceLatitudeSummary = globals.filters.occurrenceLatitudeDimension.group().reduceCount()
   globals.filters.occurrenceAltitudeSummary = globals.filters.occurrence

   //callbacks to be completed once data has been processed
   putPointsOnMap() //put circles on map

   //update chart data
   globals.elements.latitudeChart
    .dimension(globals.filters.occurrenceLatitudeDimension)
    .group(globals.filters.occurrenceLatitudeSummary);

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
  //initialize DOM elements for analytics charts on the right panel
  globals.elements.latitudeChart = dc.barChart("#latitudeChart")
    .width($("#analyticsContainer").width())
    .height($("#latitudeChart").height())
    .x(d3.scale.linear().domain([globals.config.analytics.latitudeDomainMin,globals.config.analytics.latitudeDomainMax]))
    .brushOn(false)
}

function applySavedState(){

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
  getOccurrenceData()
  //do loading stuff
  $(".cover").removeClass("cover-full").addClass("cover-half")
  $(".cover").show()
})

//hide loading screen when load is finished
Pace.on("done", function(){
    $(".cover").fadeOut(500);
});

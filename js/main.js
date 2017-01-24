//this is Ice Age Mapper
//main script
//Version 2.1
//Author: Scott Farley
//University of Wisconsin, Madison

console.log("Welcome to Ice Age Mapper.\n\tRunning script version 2.1.\n\tLead Author: Scott Farley\n\tUniversity of Wisconsin, Madison")


globals = {}

globals.data = {} //all data gets held here


globals.config = {
  //this holds rules for static configuration of the application
  //variables go in here if they will be consistent from session to session and user to user
  map: {
    primaryTileURL: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', //where to go to get tiles
    maxZoom: 8, //max zoom level of map
  }, //end map
  layout: {
    margins: {
      timePanel: {
        left: 50,
        right: 25,
        top: 0,
        bottom: 50
      }
    },//end margins
  },//end layout
  dataSources: {
    taxa: "data/taxa.json",
    ecolGroups: "http://api.neotomadb.org/v1/dbtables/ecolGroupTypes?fields=EcolGroupID,EcolGroup",
    occurrences: "http://api.neotomadb.org/v1/data/SampleData"
  },
  searchSwitch: "search",
  searchGeoBounds: [-167, 5, -50, 90],
  searchAgeBounds: [-250, 22000]
}//end config


globals.state = {//this holds all relevant info to be shared and saved.
  //variables go in here if they might be modified by the user during a session
  sitePanel : { //left-hand panel configuration that holds details about the user-selected site
    open: false, //is the panel open?
    siteID: -1,//database ID of the site the user selected
  },
  timePanel :{ //bottom panel that contains temporal brushing and browsing
    axis: 1, //multiple y-axes may be chosen, each with the same x-axis --> browsing is the same
            //1. Greenland Northern Hemisphere Temprature
            //2. Number of Samples per 500 Years --> histogram layout
  },
  time : { //temporal filter controls
    minYear: -Infinity, //most recent year in current filter
    maxYear: Infinity, //most distant year in current filter
    interval: Infinity //the interval in years between min and max years, so the user can set only one of the above
  },
  map : { //main map panel configuration
    center: [-90, 30], //center of the map
    zoom: 4, //zoom level of map
    showIce: true, //show the ice sheets during browsing
  },
  analytics: { //right hand panel with analytics charts
    open: false //is the panel open?
  }
}

globals.elements = {} //dom elements we should keep track of


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
  loadTaxa(populateTaxaAutocomplete)
  loadEcolGroups(populateEcolGroupDropdown)
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
  console.log(
    "ready to process"
  )
}

//Events
//on a change of the dropdown, filter the taxa and put them in the next dropdown
$("#ecolGroupSelect").change(function(){
  selectedGrp = $("#ecolGroupSelect :selected").val()
  filterAndPopulateTaxaDropdown(selectedGrp)
  globals.config.searchSwitch = "browse"
  $("")
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
})

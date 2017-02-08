//initialize global variables
globals = {}
globals.data = {} //all data gets held here
globals.filters = {} //holds crossfilters
globals.elements = {} //dom elements we should keep track of
                      //anatyics chart elements are here

globals.getParameterByName = function(name, url) {
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


//empty config objects to prevent errors on intialization
globals.config = {
  map: {

  },
  dataSources: {

  },
  layout: {

  },
  analytics: {

  },
  colors: {

  }
}

globals.state = {
  sitePanel : { //left-hand panel configuration that holds details about the user-selected site
  },
  timePanel :{ //bottom panel that contains temporal brushing and browsing
  },
  time : { //temporal filter controls
  },
  map : { //main map panel configuration
  },
  analytics: { //right hand panel with analytics charts
  },
  layout: {
  }
}

function getConfiguration(configID, callback){
  $.ajax("http://grad.geography.wisc.edu:8080/mapConfigs?configID=" + configID, {
      type:"GET",
      success: function(data){
        console.log(data)
        if ((data['success']) && data['data'].length > 0){
          globals.configuration = data['data'][0]['configdata']
          console.log("Using remote configuration")
        }else{
          globals.configuration = defaultConfiguration
          console.log("Using default configuration")
        }
        callback(null)
      },
      error: function(xhr, status, err){
        console.log(xhr.responseText)
      },
      beforeSend: function(){
        console.log("Getting configuration.")
      }
  })
}

//check to see if the shareToken URL parameter has been set
shareToken = globals.getParameterByName("shareToken")


//make it a queue so we could load other file at the same time, in the future
globals.configQ = queue();
globals.configQ.defer(getConfiguration, shareToken)
globals.configQ.await(applyConfiguration)



function autoLoadOccs(){
  //for now, just load the taxa and proceed without having to manually load data
  taxonid = +globals.getParameterByName("taxonid")
  //first check if taxonid is set
  if ((taxonid != undefined ) & (taxonid > 0)){
    globals.taxonid = taxonid
    globals.state.searchSwitch = "browse"
    loadNeotomaData();  //proceed with load
    return
  }
  taxonname = globals.getParameterByName("taxonname")
  if ((taxonname != undefined) && (taxonname != "")){
    globals.taxonname = taxonname
    globals.state.searchSwitch = "search"
    loadNeotomaData();  //proceed with load
    return
  }
  //otherwise, don't do anything
}


function applyConfiguration(){
  //ensure that there are no defaults that should be set but aren't
  globals.config = globals.configuration.config
  globals.state = globals.configuration.state

  //ability to load occurrences for taxon via url query string
  taxonid = +globals.getParameterByName("taxonid")
  //first check if taxonid is set
  if ((taxonid != undefined ) & (taxonid > 0)){
    globals.taxonid = taxonid
    globals.state.searchSwitch = "browse"
    globals.state.doSearch = true
  }
  taxonname = globals.getParameterByName("taxonname")
  if ((taxonname != undefined) && (taxonname != "")){
    globals.taxonname = taxonname
    globals.state.searchSwitch = "search"
    globals.state.doSearch = true
  }

  //do initialization routine
  initialize()
  //if the configuration requires autoloading data, do that now.
  if (globals.state.doSearch){
    loadNeotomaData();
  }
}

//initialize global variables
globals = {}
globals.data = {} //all data gets held here
globals.filters = {} //holds crossfilters
globals.elements = {} //dom elements we should keep track of
                      //anatyics chart elements are here



//check to see if the shareToken URL parameter has been set
shareToken = globals.getParameterByName("shareToken")


//make it a queue so we could load other file at the same time, in the future
globals.configQ = queue();
globals.configQ.defer(getConfiguration, shareToken)
globals.configQ.await(applyConfiguration)


function applyConfiguration(){
  //ensure that there are no defaults that should be set but aren't
  globals.config = globals.configuration.config
  globals.state = globals.configuration.state

  //ability to load occurrences for taxon via url query string
  taxonid = +globals.getParameterByName("taxonid")
  //first check if taxonid is set
  if ((taxonid != undefined ) && (taxonid > 0) && (taxonid != "")){
    globals.state.taxonid = taxonid
    globals.state.searchSwitch = "browse"
    globals.state.doSearch = true
  }
  taxonname = globals.getParameterByName("taxonname")
  if ((taxonname != undefined) && (taxonname != "")){
    globals.state.taxonname = taxonname
    globals.state.searchSwitch = "search"
    globals.state.doSearch = true
  }

  //do initialization routine
  initialize()
  //if the configuration requires autoloading data, do that now.
  if (globals.state.doSearch){
    loadNeotomaData();
    getTaxonInfo();
  }
}

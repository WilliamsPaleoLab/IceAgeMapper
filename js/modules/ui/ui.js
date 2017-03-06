var mapModule = require('./map.js');
var layoutModule = require('./layout.js');
var temperatureChartModule = require("./charts/temperatureChart.js");
var IO = require("./../processes/io.js");
var UIUtils = require("./ui-utils.js");
var process = require("./../processes/process.js");
var utils = require("./../processes/utils.js");
var analytics = require("./charts/charts.js");
var dc = require("dc");

var ui = (function(){
  var layout, mapChart, map, initialize, temperatureChart;


  //load a configuration from the database
  var loadFromToken = function(configToken){
    IO.getConfiguration(configToken, initialize)
  };

  var loadFromTaxonName = function(taxonname){
    var config = require("./../config/config.js");
    var state = require("./../config/state.js");
    state.doSearch = true;
    state.searchSwitch = "search"
    state.taxonname = taxonname;
    initialize(config, state)
  }

  var loadFromTaxonID = function(taxonid){
    var config = require("./../config/config.js");
    var state = require("./../config/state.js");
    state.doSearch = true;
    state.searchSwitch = "browse"
    state.taxonid = taxonid;
    initialize(config, state)
  }


  //create a new default configuration
  var loadClean = function(){
    var config = require("./../config/config.js");
    var state = require("./../config/state.js");
    initialize(config, state);
  }

  var create = function(){

    //see if the user passed in any url parameters
    var shareToken = utils.getParameterByName('shareToken');
    var taxonName = utils.getParameterByName('taxonname');
    var taxonID = utils.getParameterByName('taxonid');


    //load preferentially off those parameters --> only one will happen
    if (utils.isValidToken(shareToken)){
      loadFromToken(shareToken)
    }else if(utils.isValidTaxonName(taxonName)){
      loadFromTaxonName(taxonName)
    }else if (utils.isValidTaxonID(taxonID)){
      loadFromTaxonID(taxonID);
    }else{
      loadClean();
    }
  }

  //initialize a new UI session using the configuration either default or remote
  var  initialize = function(config, state){

    //create UI components
    layout = layoutModule.create(config, state);
    mapChart = mapModule.create();
    map = mapChart.map();

    //create the bottom temperature distribution
    temperatureChart = temperatureChartModule.create(config);


    //get the data from neotoma
    if (state.doSearch){
      IO.getNeotomaData(config, state, onNeotomDataReceipt)
    }
  } // end initialize

  function onNeotomDataReceipt(error, occurrences, datasets){
    if (error){
      UIUtils.displayError(error)
      throw error
    }
    processedData = process.mergeMetadata(occurrences, datasets);
    crossfilteredData = process.crossfilterIt(processedData)
    console.log(crossfilteredData)
    analytics.create(crossfilteredData.dimensions, crossfilteredData.groups)
    render();
  }

  function render(){
    dc.renderAll();
  }


  return {
    create:create,
    layout: layout,
    mapChart: mapChart,
    map: map,
    temperatureChart: temperatureChart
  }
})();

module.exports = ui;

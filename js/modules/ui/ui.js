var mapModule = require('./map.js');
var layoutModule = require('./layout.js');
var analyticsModule = require('./charts.js');
var temperatureChartModule = require("./charts/temperatureChart.js");
var IO = require("./../processes/io.js");
var UIUtils = require("./ui-utils.js");
var process = require("./../processes/process.js");

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
  var create = function(){
    var config = require("./../config/config.js");
    var state = require("./../config/state.js");
    initialize(config, state);
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
    console.log(processedData);
  }


  return {
    loadFromToken: loadFromToken,
    loadFromTaxonID: loadFromTaxonID,
    loadFromTaxonName: loadFromTaxonName,
    create:create,
    layout: layout,
    mapChart: mapChart,
    map: map,
    temperatureChart: temperatureChart
  }
})();

module.exports = ui;

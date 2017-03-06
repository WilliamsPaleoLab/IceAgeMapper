var mapModule = require('./map.js');
var layoutModule = require('./layout.js');
var analyticsModule = require('./charts.js');
var temperatureChartModule = require("./charts/temperatureChart.js");
var IO = require("./../processes/io.js");

var ui = (function(){
  var layout, mapChart, map, initialize, temperatureChart;

  var load = function(configToken){
    IO.getConfiguration(configToken, initialize)
  }

  var loadClean = function(){
    var config = require("./../config/config.js");
    var state = require("./../config/state.js");
    initialize(config, state);
  }

  var initialize = function(config, state){

    //create UI components
    layout = layoutModule.create(config, state);
    mapChart = mapModule.create();
    map = mapChart.map();

    //create the bottom temperature distribution
    temperatureChart = temperatureChartModule.create(config);


    //get the data from neotoma
    if (state.doSearch){
      IO.getNeotomaData(config, state, function(results, d1, d2){
        console.log(results);
        console.log(d1);
        console.log(d2);
      })
    }

  }



  return {
    load: load,
    loadClean:loadClean,
    layout: layout,
    mapChart: mapChart,
    map: map,
    temperatureChart: temperatureChart
  }
})();

module.exports = ui;

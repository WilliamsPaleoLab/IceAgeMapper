var mapModule = require('./map.js');
var layoutModule = require('./layout.js');
var analyticsModule = require('./charts.js');
var temperatureChartModule = require("./charts/temperatureChart.js")

var ui = (function(){
  var layout, mapChart, map, initialize, temperatureChart;

  var initialize = function(config, state){
    //use defaults if config and state are not explicit
    if (config === undefined){
      config = require('./../config/config.js');
    }
    if(state === undefined){
      state = require('./../config/state.js');
    }

    //create UI components
    layout = layoutModule.create(config, state);
    mapChart = mapModule.create();
    map = mapChart.map();

    temperatureChart = temperatureChartModule.create(config);

    analyticsModule.create();

    ui.analytics = analyticsModule;

  }

  return {
    initialize: initialize,
    layout: layout,
    mapChart: mapChart,
    map: map,
    temperatureChart: temperatureChart
  }
})();

module.exports = ui;

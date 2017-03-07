var crossfilter = require("crossfilter");
var dc = require('dc');
var dc_mapbox = require("./dc-mapbox.js");


var map = (function(){

  function createOptions(config, state, container){
    if (container === undefined){
      container = "map"
    }
    if (config === undefined){
      config = window.config
    }
    if(state === undefined){
      state = window.state
    }

    var opts = {
      container:container,
      center: state.map.center,
      zoom: state.map.zoom,
      bearing: state.map.bearing,
      pitch: state.map.pitch,
      style: config.map.style,
      pointType: "circle",
      pointRadius: config.map.symbolRadius,
      pointColor: config.map.symbolColor,
      latitudeField: "latitude",
      longitudeField: "longitude",
      popupTextFunction: config.map.popupTextFunction,
      renderPopup: false
    }
    return opts
  }

  //create an empty map
  function create(mapOptions){
    // //create a fake dataset to put on the map before the user selects data from Neotoma
    empty = crossfilter()
    emptyDimension = empty.dimension(function(d){return d})
    emptyGroup = emptyDimension.group().reduceCount()

    if (mapOptions === undefined){
      mapOptions = createOptions()
      console.log(mapOptions)
    }

    var mapChart = dc_mapbox.pointSymbolMap("#map", window.mapboxToken, mapOptions)
      .dimension(emptyDimension)
      .group(emptyGroup)

    mapChart.render();

    return mapChart

  } //end create function

  return {
    create: create
  }
})();

module.exports = map;

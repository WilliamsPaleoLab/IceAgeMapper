var crossfilter = require("crossfilter");
var dc = require('dc');
var dc_mapbox = require("./dc-mapbox.js");


var map = (function(){

  function createOptions(config, state, container){
    if (container === undefined){
      container = "map"
    }
    if (config === undefined){
      config = require('./../config/config.js');
    }
    if(state === undefined){
      state = require('./../config/state.js');
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

  var updateSize = function(map){
    //re-render the map when panel size changes
    if (ui.map != undefined){
      ui.map.resize();
    }else{
      ui.map.on('load', function(){
      ui.map.resize();
      })
    }
  };

  var enableMapViewLogging = function(map){
    globals.map.on('moveend', function(){
      ///update map component of state
      var center = ui.map.getCenter()
      var zoom = ui.map.getZoom()
      var bearing = ui.map.getBearing();
      var pitch = ui.map.getPitch();
      state.map.center = center
      state.map.zoom = zoom
      state.map.bearing = bearing;
    })
  }

  return {
    create: create,
    createOptions: createOptions,
    updateSize: updateSize,
    enableMapViewLogging: enableMapViewLogging
  }
})();

module.exports = map;

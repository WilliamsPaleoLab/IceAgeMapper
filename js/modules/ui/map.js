var map = (function(){
  var updateSize = function(){
    //re-render the map when panel size changes
    if (ui.map != undefined){
      ui.map.resize();
    }else{
      ui.map.on('load', function(){
      ui.map.resize();
      })
    }
  };

  var enableMapViewLogging = function(){
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
    updateSize: updateSize
  }
})();

module.exports = map;
